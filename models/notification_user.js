'use strict';
module.exports = (sequelize, DataTypes) => {
	var user_info = sequelize.define('user_info', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		title: {
		allowNull: false,
		type: DataTypes.STRING
		},
    	user_id: {
	  	type: DataTypes.UUID,
        allowNull: false,
        references: {  
          model: 'users',
          key: 'id'
        }
		}
    })
	user_info.sync()
	user_info.associate = (models) => {
    user_info.belongsTo(models.user, {foreignKey: "user_id", as: "user"})
    }
	return user_info;
}