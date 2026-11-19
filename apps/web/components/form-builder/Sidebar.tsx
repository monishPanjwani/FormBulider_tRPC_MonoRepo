"use client";

import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ElementType } from "../../lib/form-builder/types";
import { useFormStore } from "../../lib/form-builder/store";

interface SidebarItemProps {
    type: ElementType;
    label: string;
    icon: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ type, label, icon }) => {
    const addElement = useFormStore(state => state.addElement);
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `sidebar-${type}`,
        data: {
            type,
        },
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

    return (
        <button type="button"
            onClick={() => addElement({ id: crypto.randomUUID(), type, x: 0, y: 0, props: {} })}
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="w-full text-left flex items-center gap-3 p-3 mb-2 bg-card rounded-xl shadow-sm border border-border cursor-grab hover:border-primary hover:shadow-md transition-all text-foreground"
        >
            <span aria-hidden="true" className="w-6 text-center font-mono text-primary">
                {icon}
            </span>
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
};

export const Sidebar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"elements" | "design">(
        "elements",
    );
    const {
        backgroundUrl,
        customAppBg,
        customCanvasBg,
        customTextColor,
        theme,
        setFormStyle,
        setTheme,
    } = useFormStore();

    return (
        <div className="w-full md:w-64 md:shrink-0 self-start bg-card border-r border-border flex flex-col transition-colors z-20 shadow-lg backdrop-blur-xl">
            {/* Tabs */}
            <div className="p-4 border-b border-border">
                <div className="grid grid-cols-2 bg-background rounded-md p-1 border border-border">
                    <button
                        onClick={() => setActiveTab("elements")}
                        className={`py-2 text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-colors ${activeTab === "elements" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Elements
                    </button>
                    <button
                        onClick={() => setActiveTab("design")}
                        className={`py-2 text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-colors ${activeTab === "design" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Design
                    </button>
                </div>
            </div>

            {activeTab === "elements" ? (
                <div className="p-6 flex flex-col flex-1 overflow-hidden">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.25em] mb-4">
                        Click or drag to add
                    </p>
                    <div className="grid max-h-36 grid-cols-2 gap-x-2 overflow-y-auto md:max-h-none md:grid-cols-1">
                        <SidebarItem
                            type="text"
                            label="Heading / Text"
                            icon="T"
                        />
                        <SidebarItem
                            type="short-input"
                            label="Short text"
                            icon="="
                        />
                        <SidebarItem
                            type="long-input"
                            label="Long text"
                            icon="☰"
                        />
                        <SidebarItem
                            type="email"
                            label="Email"
                            icon="✉"
                        />
                        <SidebarItem type="url" label="Website URL" icon="↗" />
                        <SidebarItem
                            type="number"
                            label="Number"
                            icon="#"
                        />
                        <SidebarItem
                            type="single-select"
                            label="Single select"
                            icon="◉"
                        />
                        <SidebarItem
                            type="multi-select"
                            label="Multi select"
                            icon="☑"
                        />
                        <SidebarItem
                            type="checkbox"
                            label="Checkbox"
                            icon="✓"
                        />
                        <SidebarItem
                            type="dropdown"
                            label="Dropdown"
                            icon="▾"
                        />
                        <SidebarItem
                            type="rating"
                            label="Rating"
                            icon="★"
                        />
                        <SidebarItem
                            type="date"
                            label="Date"
                            icon="▦"
                        />
                        <SidebarItem
                            type="poll"
                            label="Poll"
                            icon="≡"
                        />
                        <SidebarItem
                            type="image"
                            label="Image Placeholder"
                            icon="▧"
                        />
                    </div>
                </div>
            ) : (
                <div className="p-6 flex flex-col flex-1 overflow-y-auto gap-6 text-foreground">
                    <div>
                        <label htmlFor="background-image" className="block text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-muted-foreground">
                            Background image URL
                        </label>
                        <input
                            type="text" id="background-image"
                            placeholder="Leave empty for solid background"
                            value={backgroundUrl || ""}
                            onChange={(e) =>
                                setFormStyle({ backgroundUrl: e.target.value })
                            }
                            className="w-full p-2.5 border rounded-xl text-sm focus:outline-none border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary transition-shadow"
                        />
                    </div>

                    <div>
                        <label htmlFor="page-color" className="block text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-muted-foreground">
                            Page background color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                aria-label="Page background color picker"
                                value={
                                    customAppBg?.startsWith("#")
                                        ? customAppBg
                                        : "#f3f4f6"
                                }
                                onChange={(e) =>
                                    setFormStyle({
                                        customAppBg: e.target.value,
                                    })
                                }
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text" id="page-color"
                                placeholder="#f3f4f6"
                                value={customAppBg || ""}
                                onChange={(e) =>
                                    setFormStyle({
                                        customAppBg: e.target.value,
                                    })
                                }
                                className="flex-1 p-2.5 border rounded-xl text-sm focus:outline-none border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary transition-shadow"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="canvas-color" className="block text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-muted-foreground">
                            Canvas color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                aria-label="Canvas color picker"
                                value={
                                    customCanvasBg?.startsWith("#")
                                        ? customCanvasBg
                                        : "#ffffff"
                                }
                                onChange={(e) =>
                                    setFormStyle({
                                        customCanvasBg: e.target.value,
                                    })
                                }
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text" id="canvas-color"
                                placeholder="#ffffff"
                                value={customCanvasBg || ""}
                                onChange={(e) =>
                                    setFormStyle({
                                        customCanvasBg: e.target.value,
                                    })
                                }
                                className="form-control min-w-0 flex-1 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="text-color" className="block text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-muted-foreground">
                            Text color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                aria-label="Text color picker"
                                value={
                                    customTextColor?.startsWith("#")
                                        ? customTextColor
                                        : "#000000"
                                }
                                onChange={(e) =>
                                    setFormStyle({
                                        customTextColor: e.target.value,
                                    })
                                }
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text" id="text-color"
                                placeholder="#000000"
                                value={customTextColor || ""}
                                onChange={(e) =>
                                    setFormStyle({
                                        customTextColor: e.target.value,
                                    })
                                }
                                className="form-control min-w-0 flex-1 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="canvas-theme" className="block text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-muted-foreground">
                            Canvas theme
                        </label>
                        <select id="canvas-theme"
                            value={theme}
                            onChange={(e) =>
                                setTheme(
                                    e.target.value as
                                        | "auto"
                                        | "light"
                                        | "dark"
                                        | "glassmorphism",
                                )
                            }
                            className="w-full p-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-shadow"
                        >
                            <option value="auto">Match app</option>
                            <option value="light">Light (Solid)</option>
                            <option value="dark">Dark (Solid)</option>
                            <option value="glassmorphism">
                                Glassmorphism (Frosted)
                            </option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};
