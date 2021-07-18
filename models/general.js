'use strict';
module.exports = (sequelize, DataTypes) => {
	var general_maintenance = sequelize.define('general_maintenance', {
		id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
        autoIncrement: true
		},
    	title: {
        type: DataTypes.TEXT
        },
    	status: {
	  	type: DataTypes.STRING,
        defaultValue: "pending"
		},
    	description: {
        type: DataTypes.TEXT
        },
   		img_url: {
        type: DataTypes.TEXT
        },
    	date: {
        type: DataTypes.STRING
        },
    	time: {
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
	});
	
	general_maintenance.sync()
	general_maintenance.associate = function(models) {
	general_maintenance.belongsTo(models.property, {foreignKey: "property_id", as: "property"})
	}
	return general_maintenance;
}