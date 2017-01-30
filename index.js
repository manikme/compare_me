var _ = require('lodash');
var moment = require('moment');
var parse = require('csv-parse/lib/sync');
var fs = require('fs');
var stringify = require('csv-stringify');

var result = [];
var inputFile='source_1.csv';
var inputFile2='source_2.csv';

var start = moment();

var fileFirst = fs.readFileSync(inputFile, 'utf8');
var fileFirstParsed = parse(fileFirst, {delimiter: ';'});
fileFirstParsed = _.sortBy(fileFirstParsed, [function(o) { return _.toInteger(o[0]); }]);

var fileSecond = fs.readFileSync(inputFile2, 'utf8');
var fileSecondParsed = parse(fileSecond, {delimiter: ';'});
fileSecondParsed = _.sortBy(fileSecondParsed, [function(o) { return _.toInteger(o[0]); }]);

if (fileSecondParsed[fileSecondParsed.length-1][0] > fileFirstParsed[fileFirstParsed.length-1][0]){
	comparator(fileSecondParsed, fileFirstParsed);
} else {
	comparator(fileFirstParsed, fileSecondParsed);
}

stringify(result, function(err, output){
  fs.writeFileSync('output.csv', output);
});

function findDiff(value, indexSecondArray, secondArray){
	var intIndexFirst = _.toInteger(value[0]);
	var intIndexSecond = _.toInteger(secondArray[indexSecondArray][0]);

	if (intIndexFirst == intIndexSecond) {
		//если слева и справа индекс одинаков - сравниваем значения, записываем, приьбавляем счетчик
		if (value[1] !== secondArray[indexSecondArray][1]){
			result.push([indexSecondArray, value[1], secondArray[indexSecondArray][1]]);
		}
		indexSecondArray ++ ;
		return indexSecondArray;
	}

	if (intIndexFirst < intIndexSecond ) {
		//console.log ('inFindDiff <', value[0], secondArray[indexSecondArray][0]);

		result.push([value[0], value[1], null]);
		return indexSecondArray;
	}

	if (intIndexFirst > intIndexSecond) {
		//console.log ('inFindDiff >', value[0], secondArray[indexSecondArray][0]);

		result.push([indexSecondArray, null, secondArray[indexSecondArray][1]]);
		indexSecondArray ++ ;
		return findDiff(value, indexSecondArray, secondArray);
	}

	return indexSecondArray;
}

function comparator (a,b){
	if(a == fileFirstParsed) {
				result.push(['Index', inputFile, inputFile2]);
	} else {
		result.push(['Index', inputFile2, inputFile]);
	}


	var bIndex = 0;
	for(var i in a){
		var current = a[i];
		if (_.isUndefined(bIndex)){
			throw new Error(['inComparator']);
		}

		if(bIndex < b.length) {
			bIndex = findDiff(current, bIndex, b);
		}

	}
}

console.log(moment(moment().diff(start)).format("m:ss"));
