'use strict';
module.exports = (sequelize, DataTypes) => {
	var user = sequelize.define('user', {
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
    	flat_id: {
	  	type: DataTypes.INTEGER,
        allowNull: false,
        references: {  
          model: 'flats',
          key: 'id'
        }
	},
    status: {
		type: DataTypes.STRING,
    defaultValue: "active"
        },
    rent_expiry: {
    type: DataTypes.STRING
    },
    rent_status: {
    type: DataTypes.STRING
    }
	});
	user.sync()
user.associate = function(models) {
    user.belongsTo(models.flat, {foreignKey: "flat_id", as: "flat"})
	}
	return user;
}