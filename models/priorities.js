'use strict';
module.exports = (sequelize, DataTypes) => {
	var priority = sequelize.define('priority', {
		id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
        autoIncrement: true
		},
    	title: {
		type: DataTypes.STRING
		}
	});
	
	priority.sync()
	priority.associate = function(models) {
    priority.hasMany(models.maintenance, {foreignKey: "priority_id", as: "maintenances"})
	}
	return priority;
}