'use strict';
module.exports = (sequelize, DataTypes) => {
	var observation = sequelize.define('observation', {
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
		type: DataTypes.TEXT
		},
    	payment: {
		type: DataTypes.BOOLEAN
		},
   		payment_amount: {
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
	});
	
	observation.sync()
	observation.associate = function(models) {
    observation.belongsTo(models.maintenance, {foreignKey: "maintenance_id", as: "maintenance"})
	}
	return observation;
}