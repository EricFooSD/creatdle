module.exports = {
  async up(queryInterface, Sequelize) {
    const user = [
      {
        name: 'Eric',
        password: 'testing',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Harry',
        password: 'testing',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert('users', user);

    const wordle = [
      {
        name: 'Eric`s testing wordle',
        description: 'testing',
        words: JSON.stringify({ words: ['sweet', 'great', 'adore'] }),
        code: 'ABC123',
        creator_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert('wordles', wordle);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('wordles', null, {});
  },
};
