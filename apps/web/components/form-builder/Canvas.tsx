"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formSurfaceStyle } from "../../lib/form-builder/surface-style";
import { useFormStore } from "../../lib/form-builder/store";
import { FormElement as IFormElement } from "../../lib/form-builder/types";

// Simple rendering for the actual element placed on the canvas
const ElementTitle: React.FC<{ el: IFormElement }> = ({ el }) => {
    const { updateElementProps } = useFormStore();
    return (
        <label
            className="font-semibold text-lg outline-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-50 empty:before:italic cursor-text block mb-3"
            contentEditable
            suppressContentEditableWarning
            aria-label="Question title"
            data-placeholder="Enter question title..."
            onBlur={(e) =>
                updateElementProps(el.id, {
                    question: e.currentTarget.textContent,
                })
            }
        >
            {el.props.question}
        </label>
    );
};

const CanvasElement: React.FC<{ el: IFormElement }> = ({ el }) => {
    const { updateElementProps } = useFormStore();
    const { type, props } = el;
    switch (type) {
        case "text":
            return (
                <h3
                    className="text-2xl font-semibold tracking-tight border-b border-dashed border-current/20 pb-2 min-w-0 outline-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-50 empty:before:italic"
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Enter your heading..."
                    onBlur={(e) =>
                        updateElementProps(el.id, {
                            text: e.currentTarget.textContent,
                        })
                    }
                >
                    {props.text}
                </h3>
            );
        case "url":
        case "short-input":
            return (
                <div className="flex flex-col w-full">
                    <ElementTitle el={el} />
                    <input
                        type={type === "url" ? "url" : "text"}
                        placeholder={props.placeholder || (type === "url" ? "https://" : "Short answer text")}
                        className="form-control pointer-events-none"
                    />
                </div>
            );
        case "long-input":
            return (
                <div className="flex flex-col w-full">
                    <ElementTitle el={el} />
                    <textarea
                        placeholder={
                            props.placeholder || "Long description text..."
                        }
                        className="form-control pointer-events-none min-h-[110px]"
                    />
                </div>
            );
        case "email":
            return (
                <div className="flex flex-col w-full">
                    <ElementTitle el={el} />
                    <input
                        type="email"
                        placeholder={props.placeholder || "Email address"}
                        className="form-control pointer-events-none"
                    />
                </div>
            );
        case "number":
            return (
                <div className="flex flex-col w-full">
                    <ElementTitle el={el} />
                    <input
                        type="number"
                        placeholder={props.placeholder || "Number"}
                        className="form-control pointer-events-none"
                    />
                </div>
            );
        case "date":
            return (
                <div className="flex flex-col w-full">
                    <ElementTitle el={el} />
                    <input
                        type="date"
                        className="form-control pointer-events-none"
                    />
                </div>
            );
        case "checkbox":
            return (
                <div className="flex flex-col w-full">
                    <ElementTitle el={el} />
                    <div className="flex items-center gap-2 mt-1">
                        <input type="checkbox" className="w-5 h-5 accent-primary pointer-events-none" />
                        <span className="text-lg font-medium">{props.label || "Checkbox Label"}</span>
                    </div>
                </div>
            );
        case "rating":
            return (
                <div className="flex flex-col w-full">
                    <ElementTitle el={el} />
                    <div className="flex gap-2 text-2xl text-amber-400 pointer-events-none mt-1">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-muted-foreground">★</span>
                    </div>
                </div>
            );
        case "dropdown":
        case "single-select":
        case "multi-select":
        case "poll":
            const options = props.options || ["Option 1", "Option 2"];
            const isMulti = type === "multi-select";
            return (
                <div className="flex flex-col gap-2 w-full">
                    <ElementTitle el={el} />
                    {type === "dropdown" && <select disabled className="form-control" aria-label={props.question || "Dropdown preview"}>
                        <option>{props.label || "Select an option"}</option>
                        {options.map((opt: string, i: number) => <option key={i}>{opt}</option>)}
                    </select>}
                    {options.map((opt: string, i: number) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 group/opt rounded-xl border border-transparent hover:border-border hover:bg-muted px-2 py-1 transition-colors"
                        >
                            {type !== "dropdown" && <input
                                type={isMulti ? "checkbox" : "radio"}
                                disabled
                                className="accent-primary"
                            />}
                            <span
                                className="outline-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-50 cursor-text min-w-[50px] border-b border-transparent focus:border-current hover:border-current/50 flex-1"
                                contentEditable
                                suppressContentEditableWarning
                                data-placeholder={`Option ${i + 1}`}
                                onBlur={(e) => {
                                    const newOptions = [...options];
                                    newOptions[i] =
                                        e.currentTarget.textContent ||
                                        `Option ${i + 1}`;
                                    updateElementProps(el.id, {
                                        options: newOptions,
                                    });
                                }}
                            >
                                {opt}
                            </span>
                            {options.length > 1 && (
                                <button
                                    onClick={() => {
                                        const newOptions = options.filter(
                                            (_: any, idx: number) => idx !== i,
                                        );
                                        updateElementProps(el.id, {
                                            options: newOptions,
                                        });
                                    }}
                                    className="opacity-100 sm:opacity-0 sm:group-hover/opt:opacity-100 sm:group-focus-within/opt:opacity-100 text-destructive hover:text-destructive transition-opacity ml-auto"
                                    title="Remove option"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={() =>
                            updateElementProps(el.id, {
                                options: [
                                    ...options,
                                    `Option ${options.length + 1}`,
                                ],
                            })
                        }
                        className="mt-1 text-sm text-primary hover:text-primary font-medium text-left self-start px-3 py-1.5 bg-accent hover:bg-accent rounded-md transition-colors"
                    >
                        + Add Option
                    </button>
                </div>
            );
        case "image":
            return (
                <div className="flex flex-col w-full">
                    <ElementTitle el={el} />
                    {props.url ? (
                        <img
                            src={props.url}
                            alt="User added"
                            className="max-w-full rounded-2xl object-contain h-48 mx-auto pointer-events-none shadow-sm"
                        />
                    ) : (
                        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center opacity-60 italic border-2 border-dashed border-border">
                            Click Settings to add Image URL
                        </div>
                    )}
                </div>
            );
        default:
            return <div>Unknown element</div>;
    }
};

const SortableItem: React.FC<{ el: IFormElement }> = ({ el }) => {
    const { removeElement, updateElementProps } = useFormStore();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: el.id, data: { type: el.type, isSortable: true } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent drag
        if (el.type === "image") {
            const url = prompt("Enter image URL:", el.props.url || "");
            if (url !== null) updateElementProps(el.id, { url });
        } else if (el.type === "short-input" || el.type === "long-input" || el.type === "email" || el.type === "url" || el.type === "number") {
            const placeholder = prompt(
                "Enter placeholder text:",
                el.props.placeholder || "",
            );
            if (placeholder !== null)
                updateElementProps(el.id, { placeholder });
        } else if (el.type === "checkbox" || el.type === "dropdown") {
            const label = prompt(
                "Enter label text:",
                el.props.label || "",
            );
            if (label !== null)
                updateElementProps(el.id, { label });
        }

    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent drag
        removeElement(el.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative p-3 sm:p-4 rounded-lg border border-transparent hover:border-primary hover:bg-muted transition-colors"
        >
            <div
                className="absolute top-2 left-2 p-1 opacity-40 cursor-grab hover:opacity-100 group-hover:opacity-100 transition-opacity"
                {...attributes}
                {...listeners}
            >
                <span className="text-xl">⋮⋮</span>
            </div>

            <div className="pl-6">
                <CanvasElement el={el} />
            </div>

            <div className="mt-2 flex flex-wrap justify-end gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                {el.type !== "text" && el.type !== "image" && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            updateElementProps(el.id, { required: !el.props.required });
                        }}
                        className={`px-3 py-1.5 rounded-full shadow-md border text-xs font-medium transition-colors ${el.props.required ? "bg-primary text-primary-foreground border-primary hover:bg-primary" : "bg-card text-muted-foreground border-input hover:bg-muted"}`}
                    >
                        Required {el.props.required ? "On" : "Off"}
                    </button>
                )}
                {["short-input", "long-input", "email", "url", "number", "image", "checkbox", "dropdown"].includes(el.type) && (
                    <button
                        onClick={handleEdit}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md shadow-md border border-border hover:bg-primary text-xs font-medium transition-colors"
                    >
                        Settings
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-destructive text-primary-foreground rounded-md shadow-md border border-border hover:bg-destructive text-xs font-medium transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export const Canvas: React.FC = () => {
    const {
        elements,
        backgroundUrl,
        theme,
        customCanvasBg,
        customTextColor,
        companyName,
        setCompanyName,
    } = useFormStore();
    const { isOver, setNodeRef } = useDroppable({
        id: "canvas-dropzone",
    });

    return (
        <div className="flex-1 min-w-0 relative flex justify-center items-start">
            {backgroundUrl && (
                <div
                    className="absolute inset-0 z-0 opacity-15 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundUrl})` }}
                />
            )}

            <div
                ref={setNodeRef}
                data-mode={theme}
                className={`form-surface relative z-10 w-full max-w-3xl min-h-[480px] p-3 sm:p-6 md:p-10 flex flex-col gap-5 ${isOver ? "ring-2 ring-primary scale-[1.01]" : ""}`}
                style={formSurfaceStyle(customCanvasBg, customTextColor)}
            >
                <div className="w-full border-b border-current/20 pb-4 mb-2">
                    <h1
                        className="text-3xl md:text-4xl font-semibold outline-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 empty:before:italic cursor-text tracking-tight"
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder="Company name"
                        onBlur={(e) =>
                            setCompanyName(e.currentTarget.textContent || "")
                        }
                    >
                        {companyName}
                    </h1>
                </div>

                {elements.length === 0 ? (
                    <div className="min-h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border p-4 rounded-md pointer-events-none bg-card">
                        <p className="text-lg">
                            Add a field from the Elements panel to start your form.
                        </p>
                    </div>
                ) : (
                    <SortableContext
                        items={elements.map((e) => e.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {elements.map((el) => (
                            <SortableItem key={el.id} el={el} />
                        ))}
                    </SortableContext>
                )}
            </div>
        </div>
    );
};
