class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async get(id) {
    return this.model.findByPk(id);
  }

  async getAll(options = {}) {
    return this.model.findAll(options);
  }

  async update(record, data) {
    return record.update(data);
  }

  async destroy(id) {
    const deletedCount = await this.model.destroy({
      where: { id },
    });

    return deletedCount > 0;
  }
}

module.exports = CrudRepository;
