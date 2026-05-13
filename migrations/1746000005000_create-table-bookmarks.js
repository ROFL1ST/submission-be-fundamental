exports.up = (pgm) => {
  pgm.createTable('bookmarks', {
    id: { type: 'uuid', primaryKey: true },
    userid: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    jobid: {
      type: 'uuid',
      notNull: true,
      references: '"jobs"',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('bookmarks');
};
