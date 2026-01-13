"use client"

import { useState } from "react"
import { DayPicker } from "react-day-picker"
import { de } from "date-fns/locale"
import { format, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import "react-day-picker/dist/style.css"

interface DateRangeCalendarProps {
  startDate: Date | undefined
  endDate: Date | undefined
  onSelect: (start: Date | undefined, end: Date | undefined) => void
  onClose: () => void
}

export function DateRangeCalendar({ startDate, endDate, onSelect, onClose }: DateRangeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date())

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      const isSameDay = startDate && range.from.toDateString() === startDate.toDateString()
      if (isSameDay && endDate) {
        // Clicking on start date when end exists - clear end date
        onSelect(range.from, undefined)
      } else if (!range.to && startDate && !endDate) {
        // First selection - set start date
        onSelect(range.from, undefined)
      } else if (range.to) {
        // Range selected
        onSelect(range.from, range.to)
      } else if (startDate && !range.to) {
        // Only one date selected after having a range - set as new start
        onSelect(range.from, undefined)
      }
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="bg-white border-2 rounded-3xl shadow-2xl p-6 w-auto max-w-[850px]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-4">
          {/* First Month */}
          <div key={currentMonth.getMonth()} className="flex-1">
            <DayPicker
              locale={de}
              month={currentMonth}
              mode="range"
              selected={{ from: startDate, to: endDate }}
              onSelect={handleSelect}
              numberOfMonths={1}
              disabled={{ before: today }}
              formatters={{
                formatCaption: (date, options) => {
                  return format(date, "MMMM yyyy", { locale: de })
                },
              }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center w-full",
                caption_label: "text-lg font-bold",
                nav: "space-x-1 flex items-center hidden",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-full",
                day_range_start: "rounded-full",
                day_range_end: "rounded-full",
                day_disabled: "text-muted-foreground opacity-50",
                day_outside: "opacity-50",
                day_selected: "bg-[#EC4899] text-white hover:bg-[#EC4899] hover:text-white focus:bg-[#EC4899] focus:text-white",
                day_range_middle: "aria-selected:bg-[#F9A8D4] aria-selected:text-[#EC4899] rounded-none",
              }}
            />
          </div>

          {/* Second Month */}
          <div key={addMonths(currentMonth, 1).getMonth()} className="flex-1 hidden sm:block">
            <DayPicker
              locale={de}
              month={addMonths(currentMonth, 1)}
              mode="range"
              selected={{ from: startDate, to: endDate }}
              onSelect={handleSelect}
              numberOfMonths={1}
              disabled={{ before: today }}
              formatters={{
                formatCaption: (date, options) => {
                  return format(date, "MMMM yyyy", { locale: de })
                },
              }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center w-full",
                caption_label: "text-lg font-bold",
                nav: "space-x-1 flex items-center hidden",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-full",
                day_range_start: "rounded-full",
                day_range_end: "rounded-full",
                day_disabled: "text-muted-foreground opacity-50",
                day_outside: "opacity-50",
                day_selected: "bg-[#EC4899] text-white hover:bg-[#EC4899] hover:text-white focus:bg-[#EC4899] focus:text-white",
                day_range_middle: "aria-selected:bg-[#F9A8D4] aria-selected:text-[#EC4899] rounded-none",
              }}
            />
          </div>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 py-2 px-4 bg-secondary hover:bg-secondary/80 rounded-2xl transition-colors font-medium"
      >
        Fertig
      </button>
    </div>
  )
}
