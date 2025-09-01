
import Error from "./error/Error"
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Label } from "./label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface Calendar22Props {
  id:string
  value?: Date
  onChange: (date: Date | undefined) => void
  label?: string
  err?: string
  className?: string
}

export function Calendar22({id, value, onChange, label , err, className }: Calendar22Props) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className={`flex flex-col w-full gap-2 ${className}`}>
      
      {label && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {value ? value.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden bg-background p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            className="bg-background"
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
        {err && <Error message={err} className="" id={id} />}
    </div>
  )
}
