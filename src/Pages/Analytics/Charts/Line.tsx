import { LineChart } from "@mui/x-charts/LineChart";
import { rooms, xLabels } from "@/components/constants";

const Line = () => {
  return (
    <LineChart
      height={300}
      series={[
        { data: rooms.firts, label: "room-1" },
        { data: rooms.second, label: "room-2" },
        { data: rooms.third, label: "room-3" },
        { data: rooms.fourth, label: "room-4" },
      ]}
      xAxis={[{ scaleType: "point", data: xLabels }]}
      yAxis={[{ width: 50 }]}
    />
  )
}

export default Line;