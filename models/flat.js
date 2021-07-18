'use strict';
module.exports = (sequelize, DataTypes) => {
	var flat = sequelize.define('flat', {
		id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
        autoIncrement: true
		},
    	flat_number: {
		type: DataTypes.STRING
		},
    	flat_description: {
        type: DataTypes.STRING
        },
		property_id: {
	  	type: DataTypes.INTEGER,
        allowNull: false,
        references: {  
          model: 'properties',
          key: 'id'
        }
        },
    	status: {
        type: DataTypes.STRING,
        defaultValue: "available"
        }
	});
	
	flat.sync()
	flat.associate = function(models) {
    flat.belongsTo(models.property, {foreignKey: "property_id", as: "property"})
    flat.hasMany(models.maintenance, {foreignKey: "flat_id", as: "maintenances"})
    flat.hasOne(models.user, {foreignKey: "flat_id", as: "user"})
	}
	return flat;
}