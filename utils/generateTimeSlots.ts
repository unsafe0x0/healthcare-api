function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number,
  gap: number,
): string[] {
  const timeSlots: string[] = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = new Date(1970, 0, 1, startHour, startMinute);
  const end = new Date(1970, 0, 1, endHour, endMinute);
  let current = new Date(start);

  function formatTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  }

  while (current < end) {
    const slotEnd = new Date(current.getTime() + duration * 60000);
    if (slotEnd > end) break;

    timeSlots.push(`${formatTime(current)} - ${formatTime(slotEnd)}`);

    current = new Date(slotEnd.getTime() + gap * 60000);
  }

  return timeSlots;
}

export { generateTimeSlots };
