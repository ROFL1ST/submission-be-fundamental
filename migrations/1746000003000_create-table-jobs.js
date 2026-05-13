exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: { type: 'uuid', primaryKey: true },
    companyid: {
      type: 'uuid',
      notNull: true,
      references: '"companies"',
      onDelete: 'CASCADE',
    },
    categoryid: {
      type: 'uuid',
      references: '"categories"',
      onDelete: 'SET NULL',
    },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    jobtype: { type: 'varchar(100)' },
    experiencelevel: { type: 'varchar(100)' },
    locationtype: { type: 'varchar(100)' },
    locationcity: { type: 'varchar(255)' },
    salarymin: { type: 'integer' },
    salarymax: { type: 'integer' },
    issalaryvisible: { type: 'boolean', default: true },
    status: { type: 'varchar(50)', default: 'open' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};
