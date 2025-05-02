export const formatDateToTime = (isoString: string) => {
    const date = new Date(isoString)
    const localTime = date.toLocaleTimeString();
    return localTime;
}

export const formatDateToDateTime = (isoString: string) => {
    const date = new Date(isoString)
    const localDateTime = date.toLocaleString();
    return localDateTime;
}

