function compareTime(time1, time2) {
  const d1 = new Date(time1);
  const d2 = new Date(time2);
  return d1.getTime() > d2.getTime();
}

module.exports = compareTime;
