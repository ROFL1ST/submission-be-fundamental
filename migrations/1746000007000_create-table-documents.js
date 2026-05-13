exports.up = (pgm) => {
  pgm.createTable('documents', {
    id: { type: 'uuid', primaryKey: true },
    userid: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    filename: { type: 'varchar(255)' },
    originalname: { type: 'varchar(255)' },
    mimetype: { type: 'varchar(100)' },
    size: { type: 'integer' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('documents');
};
