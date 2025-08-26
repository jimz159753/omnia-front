import { StyledBox, StyledTypography } from "../Events.styles";
import { Box, Typography } from "@mui/material";
import { formatDateToDateTime, formatDateToTime } from "@/utils";
import { IBooking } from "@/constants";

const ModalContent = ({
  selectedBooking,
}: {
  selectedBooking: IBooking | null;
}) => (
  <StyledBox>
    <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
      {selectedBooking?.title}
    </Typography>
    <Typography sx={{ fontSize: "16px" }}>
      {selectedBooking?.attendees.map((attendee) => attendee.email).join(", ")}
    </Typography>
    <Typography sx={{ fontSize: "16px" }}>
      {selectedBooking?.createdAt &&
        formatDateToDateTime(selectedBooking.createdAt)}
    </Typography>
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        marginY: "10px",
      }}
    >
      <StyledTypography>
        {selectedBooking?.start && formatDateToTime(selectedBooking.start)}
      </StyledTypography>
      <StyledTypography>
        {selectedBooking?.end && formatDateToTime(selectedBooking.end)}
      </StyledTypography>
    </Box>
    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
      {selectedBooking?.location}
    </Typography>
  </StyledBox>
);

export default ModalContent;
