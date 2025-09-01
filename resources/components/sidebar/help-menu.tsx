import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import ImageButton from "../button/ImageBtn"

export default function HelpMenu({ onClose }: { onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [onClose])

    const options: { label: string; route: string }[] = [
        { label: "Documentation", route: "/docs" },
        { label: "Feedback", route: "/feedback" },
        { label: "Keyboard Shortcuts", route: "/shortcuts" },
        { label: "Markdown Reference", route: "/markdown" },
        { label: "FAQ", route: "/faq" },
        { label: "Video Demos", route: "/demos" },
        { label: "Service Status", route: "/status" },
        { label: "Maintenance Calendar", route: "/maintenance" },
        { label: "Support", route: "/support" },
        { label: "About YouTrack", route: "/about" },
    ]

    const handleClick = (route: string) => {
        navigate(route)
        onClose()
    }

    return (
        <div
            ref={ref}
            className="sm:ml-2 w-64 bg-background p-2 text-foreground shadow-xl rounded-md z-50"
        >
            <ImageButton
                className="block ml-auto border border-ring/30 p-1"
                icon={"close"}
                onClick={onClose}
            />

            {options.map((opt, i) => (
                <div
                    key={i}
                    className="px-4 py-2 text-sm hover:bg-background/20 cursor-pointer text-foreground/70 hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleClick(opt.route)}
                >
                    {opt.label}
                </div>
            ))}
            <div className="p-4 text-xs text-foreground/50 border-t border-ring/30">
                Business Management Software<br />
                <span>Build 2025.1.82518<br />Friday, June 20, 2025</span><br />
                <span>Aaran Software</span>
            </div>
        </div>
    )
}
