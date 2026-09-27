const db = require('../../../src/models');
const { Airplane } = db;

describe('Airplane Model', () => {
  it('should instantiate an airplane with valid attributes', () => {
    const airplane = Airplane.build({
      modelNumber: 'Boeing 787-9',
      capacity: 290,
    });

    expect(airplane.modelNumber).toBe('Boeing 787-9');
    expect(airplane.capacity).toBe(290);
  });

  it('should fail validation when capacity is less than 1', async () => {
    const airplane = Airplane.build({
      modelNumber: 'Test Plane',
      capacity: 0,
    });

    await expect(airplane.validate()).rejects.toThrow();
  });

  it('should fail validation when modelNumber is empty', async () => {
    const airplane = Airplane.build({
      modelNumber: '',
      capacity: 100,
    });

    await expect(airplane.validate()).rejects.toThrow();
  });
});
