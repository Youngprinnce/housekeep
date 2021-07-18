'use strict';
module.exports = (sequelize, DataTypes) => {
	var issue = sequelize.define('issue', {
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
	issue.sync()
	issue.associate = (models) => {
    issue.belongsTo(models.maintenance, {foreignKey: "maintenance_id", as: "maintenance"})
    }
	return issue;
}