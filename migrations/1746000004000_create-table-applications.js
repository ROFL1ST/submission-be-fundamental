exports.up = (pgm) => {
  pgm.createTable('applications', {
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
    status: { type: 'varchar(50)', default: 'pending' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('applications');
};
