import {useEffect, useState} from "react";
import Button from "../../../resources/components/button/Button";


interface AnnouncementProps {
    id: string;
    title: string;
    description: string;
}

function Announcement({id, title, description}: AnnouncementProps) {
    const [visible, setVisible] = useState(false);
    const [doNotShow, setDoNotShow] = useState(false);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        const permanentlyDismissed = localStorage.getItem(`announcement_dismissed_${id}`);
        const temporarilyDismissed = sessionStorage.getItem(`announcement_temp_dismissed_${id}`);
        if (!permanentlyDismissed && !temporarilyDismissed) {
            setVisible(true);
        }
    }, [id]);

    useEffect(() => {
        if (visible) {
            setTimeout(() => setEntered(true), 50);
        }
    }, [visible]);

    const handleClose = () => {
        if (doNotShow) {
            localStorage.setItem(`announcement_dismissed_${id}`, "true"); // permanent
        } else {
            sessionStorage.setItem(`announcement_temp_dismissed_${id}`, "true"); // temp
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            className={`fixed bottom-0 right-0 m-5 w-[90vw] max-w-[400px] px-4 py-3 rounded-md shadow-md border bg-background text-foreground transition-all duration-500 ease-in-out
        ${entered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-95"}
        ring-1 ring-blue-300 dark:ring-blue-800 bg-blue-50 dark:bg-blue-950
      `}
        >
            <h3 className="text-base font-semibold mb-1">{title}</h3>
            <p className="text-sm text-foreground/80 mb-3">{description}</p>

            <div className="flex items-center justify-between">
                <label className="text-sm flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={doNotShow}
                        onChange={() => setDoNotShow((v) => !v)}
                        className="accent-blue-600"
                    />
                    Don't show again
                </label>

                <Button
                    label="Close"
                    onClick={handleClose}
                    className="text-sm text-delete bg-foreground/10 px-3 py-1 hover:bg-delete hover:text-delete-foreground"
                    children={undefined}/>
            </div>
        </div>
    );
}

export default Announcement;
