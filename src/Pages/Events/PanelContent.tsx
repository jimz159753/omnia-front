import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { Box } from '@mui/material'
import { IBooking } from '@/constants'
import { EventClickArg } from '@fullcalendar/core/index.js'

interface PanelContentProps {
  row: IBooking;
  setSelectedBooking: (event: any) => void;
  bookings: IBooking[];
}

const PanelContent = ({row, setSelectedBooking, bookings}: PanelContentProps) => {
  const handleBookingClick = (info: EventClickArg) => {
    console.log('info ', info)
    setSelectedBooking(info.event._def.extendedProps)
  }

  return (
    <Box padding={5}>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={bookings.map(booking => ({
          start: booking.start,
          end: booking.end,
          title: booking.title,
          id: booking.id.toString(),
          extendedProps: booking
        }))}
        eventClick={handleBookingClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        }}
      />
    </Box>
  )
}

export default PanelContent