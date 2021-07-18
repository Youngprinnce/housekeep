'use strict';
module.exports = (sequelize, DataTypes) => {
	var admin = sequelize.define('admin', {
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
    	img_url: {
        type: DataTypes.STRING
        },
    	pass_reset_token: {
        type: DataTypes.STRING
        }
	});
	
	admin.sync()
	return admin;
}