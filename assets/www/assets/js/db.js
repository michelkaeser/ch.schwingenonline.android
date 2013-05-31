/**
 *
 */
function db_has_entry(table, field, value) {
	_db.transaction(function(db) {
		db.executeSql('SELECT ' + field + ' FROM ' + table + ' WHERE ' + field ' = ' + value, [], function(db, respond) {
			return respond.rows.length > 0;
		}, function(db, respond) {
			return false;
		});
	});
}