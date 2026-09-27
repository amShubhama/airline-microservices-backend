const db = require('../../../src/models');
const { Seat } = db;
const { SEAT_TYPE } = require('../../../src/utils/common/enums');

describe('Seat Model', () => {
  it('should instantiate a valid seat with default Economy type', () => {
    const seat = Seat.build({
      airplaneId: 1,
      row: 12,
      col: 'A',
    });

    expect(seat.type).toBe(SEAT_TYPE.ECONOMY);
    expect(seat.row).toBe(12);
    expect(seat.col).toBe('A');
  });

  it('should uppercase seat column in beforeValidate hook', async () => {
    const seat = Seat.build({
      airplaneId: 1,
      row: 5,
      col: 'b',
      type: SEAT_TYPE.BUSINESS,
    });
    await seat.validate();

    expect(seat.col).toBe('B');
  });

  it('should fail validation when row is less than 1', async () => {
    const seat = Seat.build({
      airplaneId: 1,
      row: 0,
      col: 'C',
    });

    await expect(seat.validate()).rejects.toThrow();
  });
});
