'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Check if Users table exists
      const [tables] = await queryInterface.sequelize.query("SHOW TABLES LIKE 'Users'", {
        transaction,
      });
      if (tables.length === 0) {
        await transaction.commit();
        return;
      }

      // 2. Inspect current 'id' column definition
      const [columns] = await queryInterface.sequelize.query("SHOW COLUMNS FROM Users LIKE 'id'", {
        transaction,
      });

      if (columns.length > 0) {
        const idCol = columns[0];
        const isInt = idCol.Type.toLowerCase().includes('int');
        const isAutoIncrement = idCol.Extra.toLowerCase().includes('auto_increment');

        if (isInt) {
          // Check if table contains existing rows
          const [rows] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM Users', { transaction });
          const rowCount = rows[0].count;

          if (rowCount > 0) {
            // Safe zero-data-loss UUID migration for populated tables:
            // a) Add temporary UUID column
            await queryInterface.sequelize.query('ALTER TABLE Users ADD COLUMN temp_uuid CHAR(36) NULL', {
              transaction,
            });

            // b) Populate with RFC 4122 v4 UUIDs
            await queryInterface.sequelize.query('UPDATE Users SET temp_uuid = (UUID()) WHERE temp_uuid IS NULL', {
              transaction,
            });

            // c) Strip AUTO_INCREMENT from original id
            if (isAutoIncrement) {
              await queryInterface.sequelize.query('ALTER TABLE Users MODIFY id INT NOT NULL', {
                transaction,
              });
            }

            // d) Drop existing primary key on old id
            await queryInterface.sequelize.query('ALTER TABLE Users DROP PRIMARY KEY', {
              transaction,
            });

            // e) Drop old integer id column
            await queryInterface.sequelize.query('ALTER TABLE Users DROP COLUMN id', {
              transaction,
            });

            // f) Rename temp_uuid to id and set as primary key
            await queryInterface.sequelize.query(
              'ALTER TABLE Users CHANGE COLUMN temp_uuid id CHAR(36) NOT NULL PRIMARY KEY',
              { transaction },
            );
          } else {
            // If empty, strip AUTO_INCREMENT and change column directly
            if (isAutoIncrement) {
              await queryInterface.sequelize.query('ALTER TABLE Users MODIFY id INT NOT NULL', {
                transaction,
              });
            }
            await queryInterface.sequelize.query('ALTER TABLE Users MODIFY id CHAR(36) NOT NULL', {
              transaction,
            });
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Prevent blind conversion if rows contain non-numeric UUIDs
      const [rows] = await queryInterface.sequelize.query("SELECT id FROM Users WHERE id REGEXP '[^0-9]' LIMIT 1", {
        transaction,
      });

      if (rows.length > 0) {
        throw new Error(
          'Cannot revert UUID migration: Users table contains UUID strings that cannot be safely converted to integers without data loss.',
        );
      }

      // If all IDs are numeric or table is empty, safe to revert
      await queryInterface.sequelize.query('ALTER TABLE Users MODIFY id INT NOT NULL AUTO_INCREMENT', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
