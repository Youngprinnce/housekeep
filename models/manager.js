'use strict';
module.exports = (sequelize, DataTypes) => {
	var manager = sequelize.define('manager', {
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
		password: {
		allowNull: false,
		type: DataTypes.STRING
		},
    	pass_reset_token: {
		type: DataTypes.STRING
        },
    	img_url: {
		type: DataTypes.STRING
        },
    	phone: {
		type: DataTypes.STRING
        },
    	status: {
    	type: DataTypes.STRING,
        defaultValue: "active"
    }
	});
	manager.sync()
manager.associate = function(models) {
    manager.hasMany(models.property, {foreignKey: "manager_id", as: "properties"})
	}
	return manager;
}