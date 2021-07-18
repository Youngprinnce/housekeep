'use strict';
module.exports = (sequelize, DataTypes) => {
	var maintenance = sequelize.define('maintenance', {
		id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
        autoIncrement: true
		},
    	title: {
        type: DataTypes.TEXT
        },
    	flat_id: {
	  	type: DataTypes.INTEGER,
        allowNull: false,
        references: {  
          model: 'flats',
          key: 'id'
        }
		},
    	cat_id: {
	  	type: DataTypes.INTEGER,
        allowNull: false,
        references: {  
          model: 'maintenance_cats',
          key: 'id'
        }
		},
    	status: {
	  	type: DataTypes.STRING,
        defaultValue: "pending"
		},
    	priority_id: {
	  	type: DataTypes.INTEGER,
        allowNull: false,
        references: {  
          model: 'priorities',
          key: 'id'
        }
		},
    	contractor_id: {
	  	type: DataTypes.UUID,
        allowNull: true,
		},
    	description: {
        type: DataTypes.TEXT
        },
   		img_url: {
        type: DataTypes.TEXT
        },
    	available_date: {
        type: DataTypes.STRING
        },
    	available_time: {
        type: DataTypes.STRING
        },
        progress_status: {
        type: DataTypes.STRING
        },
        contractor_arrival: {
            type: DataTypes.STRING
        }
	});
	
	maintenance.sync()
	maintenance.associate = function(models) {
    maintenance.belongsTo(models.priority, {foreignKey: "priority_id", as: "priority"})
    maintenance.belongsTo(models.maintenance_cat, {foreignKey: "cat_id", as: "category"})
    maintenance.belongsTo(models.flat, {foreignKey: "flat_id", as: "flat"})
    maintenance.hasOne(models.observation, {foreignKey: "maintenance_id", as: "observation"})
    maintenance.hasMany(models.activity, {foreignKey: "maintenance_id", as: "activities"})
    maintenance.hasMany(models.purchase, {foreignKey: "maintenance_id", as: "purchases"})
    maintenance.hasMany(models.issue, {foreignKey: "maintenance_id", as: "issues"})
	}
	return maintenance;
}