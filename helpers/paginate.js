function dateRange(start, end, centerDate) {
    const startDate = new Date(centerDate);
    startDate.setDate(startDate.getDate() - start);
  
    const endDate = new Date(centerDate);
    endDate.setDate(endDate.getDate() + end);
  
    return { startDate, endDate };
}
module.exports = { 
    dateRange,
}