import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { Box } from '@mui/material'
import { IBooking } from '@/constants'
import { EventClickArg } from '@fullcalendar/core/index.js'
import './FullCalendar.css'

interface PanelContentProps {
  row: IBooking;
  setSelectedBooking: (event: IBooking) => void;
  bookings: IBooking[];
  setIsOpenModal: (isOpen: boolean) => void;
}

const PanelContent = ({setSelectedBooking, bookings, setIsOpenModal}: PanelContentProps) => {
  const handleBookingClick = (info: EventClickArg) => {
    setSelectedBooking(info.event._def.extendedProps as IBooking)
    setIsOpenModal(true)
  }

  return (
    <Box padding={5}>
      <FullCalendar
        eventClassNames='event-class'
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
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }}
      />
    </Box>
  )
}

export default PanelContent