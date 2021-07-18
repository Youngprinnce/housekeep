'use strict';
module.exports = (sequelize, DataTypes) => {
	var maintenance_cat = sequelize.define('maintenance_cat', {
		id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
        autoIncrement: true
		},
    	title: {
		type: DataTypes.STRING
		},
    	description: {
        type: DataTypes.STRING
        },
   		img_url: {
        type: DataTypes.TEXT
        }
	});
	
	maintenance_cat.sync()
	maintenance_cat.associate = function(models) {
    maintenance_cat.hasMany(models.maintenance, {foreignKey: "cat_id", as: "maintenances"})
	}
	return maintenance_cat;
}