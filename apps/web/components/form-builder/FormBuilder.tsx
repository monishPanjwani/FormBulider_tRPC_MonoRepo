"use client";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import {
    DndContext,
    DragEndEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import { writeFormDocument } from "../../lib/form-builder/form-document";
import { ThemeToggle } from "../ThemeToggle";
import { Sidebar } from "./Sidebar";
import { Canvas } from "./Canvas";
import { useFormStore } from "../../lib/form-builder/store";
import { ElementType } from "../../lib/form-builder/types";

const generateId = () => Math.random().toString(36).substring(2, 9);

const EmailInput = ({ emails, onChange }: { emails: string[], onChange: (emails: string[]) => void }) => {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newEmail = inputValue.trim();
            if (newEmail && !emails.includes(newEmail)) {
                onChange([...emails, newEmail]);
            }
            setInputValue("");
        } else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
            onChange(emails.slice(0, -1));
        }
    };

    const removeEmail = (emailToRemove: string) => {
        onChange(emails.filter(e => e !== emailToRemove));
    };

    return (
        <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 border border-border rounded-lg bg-card min-w-[250px] max-w-[400px]">
            {emails.map(email => (
                <span key={email} className="flex items-center gap-1 bg-accent text-primary px-2 py-0.5 rounded text-xs font-medium">
                    {email}
                    <button onClick={() => removeEmail(email)} className="hover:text-primary text-sm leading-none">&times;</button>
                </span>
            ))}
            <input
                type="text"
                placeholder={emails.length === 0 ? "Add emails (press Enter)" : "Add more..."}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-xs text-foreground"
            />
        </div>
    );
};

export const FormBuilder: React.FC<{
    onBack: () => void;
    onPreview: () => void;
    formId?: string;
}> = ({ onBack, onPreview, formId }) => {
    const {
        addElement,
        elements,
        reorderElements,
        backgroundUrl,
        customAppBg,
        visibility,
        setVisibility,
        allowedEmails,
        setAllowedEmails,
        companyName,
    } = useFormStore();
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement before drag starts (allows clicks on buttons to work)
            },
        }),
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { over, active } = event;

        if (!over) return;

        // Handle reordering inside Canvas
        if (active.data.current?.isSortable && over.data.current?.isSortable) {
            if (active.id !== over.id) {
                const oldIndex = elements.findIndex(
                    (el) => el.id === active.id,
                );
                const newIndex = elements.findIndex((el) => el.id === over.id);
                reorderElements(oldIndex, newIndex);
            }
            return;
        }

        // Handle dropping new item from Sidebar
        if (
            !active.data.current?.isSortable &&
            (over.id === "canvas-dropzone" || over.data.current?.isSortable)
        ) {
            const type = active.data.current?.type as ElementType;
            if (type) {
                // If dropped over a sortable item, we could insert it at a specific index,
                // but for simplicity we'll append it for now (or you can calculate index based on over.id)
                const newElement = {
                    id: generateId(),
                    type,
                    x: 0,
                    y: 0,
                    props: {},
                };

                addElement(newElement);

                if (over.id !== "canvas-dropzone") {
                    // It was dropped onto an existing element, let's move it to that position
                    setTimeout(() => {
                        const {
                            elements: currentElements,
                            reorderElements: reorder,
                        } = useFormStore.getState();
                        const oldIndex = currentElements.findIndex(
                            (e) => e.id === newElement.id,
                        );
                        let newIndex = currentElements.findIndex(
                            (e) => e.id === over.id,
                        );
                        // if dropping below half point, maybe insert after, but dnd-kit closestCenter does this ok.
                        if (oldIndex !== -1 && newIndex !== -1) {
                            reorder(oldIndex, newIndex);
                        }
                    }, 0);
                }
            }
        }
    };

    const utils = trpc.useUtils();
    const updateMutation = trpc.form.update.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
            toast.success("Form saved successfully!");
            router.push("/dashboard");
        },
        onError: (err) => toast.error("Failed to save: " + err.message)
    });

    const handleSaveToDB = () => {
        if (!formId) {
            toast.error("No Form ID found to save to.");
            return;
        }

        let dbVisibility: "public" | "unlisted" | "private" = "public";
        let dbStatus: "draft" | "published" | "unpublished" = "published";

        if (visibility === "private") {
            dbVisibility = "private";
            dbStatus = "published";
        } else if (visibility === "unlisted") {
            dbVisibility = "unlisted";
            dbStatus = "draft";
        }

        updateMutation.mutate({
            id: formId,
            title: companyName || "Interactive Form",
            visibility: dbVisibility,
            status: dbStatus,
            allowedEmails: allowedEmails,
            elements: writeFormDocument(useFormStore.getState()),
        });
    };

    return (
        <div
            className="studio-grid min-h-screen flex flex-col text-foreground relative"
            style={{ backgroundColor: customAppBg || undefined }}
        >
            {/* Background Image Overlay */}
            {backgroundUrl && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundUrl})` }}
                    />
                    <div className="absolute inset-0 bg-background/75 backdrop-blur-sm transition-colors" />
                </div>
            )}

            {/* Top Navigation / Toolbar */}
            <div className="py-3 flex-wrap gap-3 border-b border-border flex items-center justify-between px-6 bg-card backdrop-blur-xl shadow-sm z-20 transition-colors">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 rounded-md bg-card hover:bg-card transition-colors shadow-sm border border-border text-sm font-medium"
                        >
                            ← Back
                        </button>
                    )}
                    <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">
                        Formcraft Studio
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Visibility Controls */}
                    <div className="flex items-center bg-background p-1.5 rounded-md border border-border">
                        <button
                            onClick={() => setVisibility("public")}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${visibility === "public" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Public
                        </button>
                        <button
                            onClick={() => setVisibility("private")}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${visibility === "private" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Private
                        </button>
                        <button
                            onClick={() => setVisibility("unlisted")}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${visibility === "unlisted" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Unlisted
                        </button>
                    </div>

                    {visibility === "private" && (
                        <div className="flex items-center">
                            <EmailInput emails={allowedEmails} onChange={setAllowedEmails} />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 sm:border-l sm:border-border sm:pl-4">
                        <ThemeToggle />

                        <button
                            onClick={onPreview}
                            className="px-4 py-2 bg-card text-foreground border border-border hover:bg-card rounded-md font-medium transition-colors shadow-sm"
                        >
                            Preview
                        </button>

                        <button
                            onClick={handleSaveToDB}
                            disabled={updateMutation.isPending}
                            className="bg-primary hover:bg-primary text-primary-foreground px-5 py-2 rounded-md font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {updateMutation.isPending ? "Saving..." : "Save form"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col md:flex-row items-stretch z-10 relative">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <Sidebar />
                    <main className="min-w-0 flex-1 p-3 md:p-8 flex justify-center">
                        <Canvas />
                    </main>
                    <DragOverlay>
                        {activeId ? (
                            <div className="p-3 bg-card shadow-xl rounded-xl border border-primary cursor-grabbing">
                                Dragging Element
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
};

export default FormBuilder;
