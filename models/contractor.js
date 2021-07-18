'use strict';
module.exports = (sequelize, DataTypes) => {
	var contractor = sequelize.define('contractor', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		firstName: {
		allowNull: false,
		type: DataTypes.STRING
		},
		lastName: {
		allowNull: false,
		type: DataTypes.STRING
		},
		email: {
		allowNull: false,
		type: DataTypes.STRING,
		unique: true
		},
    	img_url: {
		type: DataTypes.STRING
        },
    	phone: {
		type: DataTypes.STRING
        }
	});
	contractor.sync()
	contractor.associate = (models) => {
    contractor.hasMany(models.maintenance, {foreignKey: "contractor_id", as: "maintenances"})
    }
	return contractor;
}