'use strict';
module.exports = (sequelize, DataTypes) => {
	var property = sequelize.define('property', {
		id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
        autoIncrement: true
		},
    	manager_id: {
	  	type: DataTypes.UUID,
        allowNull: false,
        references: {  
          model: 'managers',
          key: 'id'
        }
		},
    	property_name: {
		type: DataTypes.STRING
		},
		location: {
		type: DataTypes.STRING
		},
   		property_description: {
        type: DataTypes.STRING
        },
    	img_url: {
         type: DataTypes.STRING
        }
	});
	
	property.sync()
	property.associate = function(models) {
    property.hasMany(models.flat, {foreignKey: "property_id", as: "flats"})
    property.belongsTo(models.manager, {foreignKey: "manager_id", as: "manager"})
	}
	return property;
}