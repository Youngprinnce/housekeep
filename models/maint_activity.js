'use strict';
module.exports = (sequelize, DataTypes) => {
	var activity = sequelize.define('activity', {
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
    	maintenance_id: {
	  	type: DataTypes.INTEGER,
        allowNull: false,
        references: {  
          model: 'maintenances',
          key: 'id'
        }
		}
    })
	activity.sync()
	activity.associate = (models) => {
    activity.belongsTo(models.maintenance, {foreignKey: "maintenance_id", as: "maintenance"})
    }
	return activity;
}