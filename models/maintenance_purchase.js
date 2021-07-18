'use strict';
module.exports = (sequelize, DataTypes) => {
	var purchase = sequelize.define('purchase', {
		id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
        autoIncrement: true
		},
    	title: {
		type: DataTypes.STRING
		},
   		payment_amount: {
		type: DataTypes.STRING
		},
    	payment_quantity: {
		type: DataTypes.INTEGER
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
	
	purchase.sync()
	purchase.associate = function(models) {
    purchase.belongsTo(models.maintenance, {foreignKey: "maintenance_id", as: "maintenance"})
	}
	return purchase;
}