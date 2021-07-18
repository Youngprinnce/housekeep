'use strict';
module.exports = (sequelize, DataTypes) => {
	var manager_info = sequelize.define('manager_info', {
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
    	manager_id: {
	  	type: DataTypes.UUID,
        allowNull: false,
        references: {  
          model: 'managers',
          key: 'id'
        }
		}
    })
	manager_info.sync()
	manager_info.associate = (models) => {
    manager_info.belongsTo(models.manager, {foreignKey: "manager_id", as: "manager"})
    }
	return manager_info;
}