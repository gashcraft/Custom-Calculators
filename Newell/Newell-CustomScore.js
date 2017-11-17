var CUSTOMCALCULATOR = {
	// Newell-CustomScore.js - Custom Scoring For Newell
	// Version 0.1 AKA "First Draft"
	
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
    	// Global 'Constants'
        pointsA = 0; // Acceptable (85% - 100%)
    	pointsOI = 2; // Ongoing Improvement (71% - 84%)
        pointsIR = 4; // Immediate Resolution (51% - 70%)
        pointsNE = 5; // No Exception (0% - 50%)
    	maxOI = 84; // Maximum score 1 or more OI (84%)
        maxIR = 70; // Maximum score 1 or more IR (70%)
        maxNE = 50; // Maximum score 1 or more NE (50%)

        // first it is a good idea to score the result with the standard calculator
        var result = calculatorService.calculateStandardScore(auditResult);
        var parentCategory = null;

		//--------
		// Name
		// Custom Calculator
		// Description
		// Overall rating: 
		// 	Acceptable (A) - (85% to 100%) 
		// 	Ongoing Improvement (OI) - (71% - 84%) 
		// 	Immediate Resolution (IR) - (51 – 70%) 
		// 	No-Exception (NE) - (0% - 50%) 
		// 
		// Criteria: 
		// When there is 1 “No Exception (NE)” finding, it should automatically drop the overall score to 50% NE rating.
		// 	If there are more than one NE finding the score should reflect that with further deductions. 
		// When there is 1 “Immediate Resolution (IR)” finding, it should drop the overall score to a 70% 
		// 	and keep deducting based upon more IR level findings up to 51%. 
		// When there is only “Ongoing Improvement (OI)” finding, it should drop the overall score to 
		// 	a 84% and keep deducting based upon more OI level findings up to 71%. 
		// Apart from the overall score of audit, we would like to have the section score so that we 
		// 	can have a comprehensive data for identify the strength and weakness of supplier. 
		// For Acceptable (A), we have a question on the situation of no violation was found.
		// 	Would the audit will get a score of 85% or 100%?  
        //--------

        this.calculatorService = calculatorService;
        this.auditScoreSets = {
            questionCount: 0, // Number of questions answered
            pointsDeducted: 0, // Start with 0 points deducted
	    	countA: 0, // Acceptable (85% - 100%)
    	    countOI: 0, // Ongoing Improvement (71% - 84%)
        	countIR: 0, // Immediate Resolution (51% - 70%)
        	countNE: 0 // No Exception (0% - 50%)
        };

        if (result.categories) {
            for (var i = 0, len = result.categories.length; i < len; i++) {
                var category = result.categories[i];
                this.calculateCategory(category, this.auditScoreSets);
            }
        }
        
        // Set the overall score
        var newOverallScore = 100;
        if (this.auditScoreSets.countNE > 0) {
        	newOverallScore = maxNE;
			this.auditScoreSets.countNE--;
        } else if (this.auditScoreSets.countIR > 0) {
        	newOverallScore = maxIR;
			this.auditScoreSets.countIR--;
        } else if (this.auditScoreSets.countOI > 0) {
        	newOverallScore = maxOI;
			this.auditScoreSets.countOI--;
        }
        newOverallScore -= pointsNE * this.auditScoreSets.countNE;
        newOverallScore -= pointsIR * this.auditScoreSets.countIR;
        newOverallScore -= pointsOI * this.auditScoreSets.countOI;
        if (newOverallScore < 0) {
        	newOverallScore = 0;
        }
        result.score.percentage = newOverallScore;
        return result;
    },
    /**
     * calculateCategory - calculate an audit category or subcategory
     * the category/subcategory score is a single formula based on all questions within the category.
     * category/subcategory with name 'Product Code Info' will not be included in scoring.
     * each question look at selected choice and points earned. each category has a total of 100 points
     * Use standard whole integer rounding e.g. 76.5% = 77%
     * @param category - the category to calculate.
     */
    calculateCategory: function (category, auditScoreSets) {
        var myAuditScoreSets = {
            questionCount: 0,
            pointsDeducted: 0, // start with 0 points deducted
	    	countA: 0, // A - Acceptable (85% - 100%)
    	    countOI: 0, // OI - Ongoing Improvement (71% - 84%)
        	countIR: 0, // IR - Immediate Resolution (51% - 70%)
        	countNE: 0 // NE - No Exception (0% - 50%)
        };
        // Collect questions and points for this category
        if (category.questions) {
        	var questions = category.questions;
            for (var i = 0, len = questions.length; i < len; i++) {
                var question = questions[i];
                if (question.answer) {
                    var answer = question.answer; // this.calculatorService.getQuestionResponse(question);
                    if (answer && answer.choice && answer.choice.label) {
                    	if (answer.choice.label.toUpperCase() === "A") {
                			myAuditScoreSets.countA++;
							myAuditScoreSets.questionCount += 1;
						} else if (answer.choice.label.toUpperCase() === "OI") {
                			myAuditScoreSets.countOI++;
							myAuditScoreSets.questionCount += 1;
						} else if (answer.choice.label.toUpperCase() === "IR") {
                			myAuditScoreSets.countIR++;
							myAuditScoreSets.questionCount += 1;
						} else if (answer.choice.label.toUpperCase() === "NE") {
                			myAuditScoreSets.countNE++;
							myAuditScoreSets.questionCount += 1;
                		}
                	}
                }
            }
        }
        // Process subcategory for questions and points
		if (category.categories) {
			for (var sub = 0, sublen = category.categories.length; sub < sublen; sub++) {
				var subcategory = category.categories[sub];
				this.calculateCategory(subcategory, myAuditScoreSets);
			}
		}

        // Rollup collected questions & points for overall scoring
        auditScoreSets.questionCount += myAuditScoreSets.questionCount;
        auditScoreSets.pointsDeducted += myAuditScoreSets.pointsDeducted;
        auditScoreSets.countA += myAuditScoreSets.countA;
        auditScoreSets.countOI += myAuditScoreSets.countOI;
        auditScoreSets.countIR += myAuditScoreSets.countIR;
        auditScoreSets.countNE += myAuditScoreSets.countNE;
        
		// Calculate score for the category; include (any) child questions and points
		//	Only set a percentage if questions existed.
		//	Otherwise no percentage attribute will exist.
        if (myAuditScoreSets.questionCount > 0) {
			// Set the overall score
			newOverallScore = 100;
			if (myAuditScoreSets.countNE > 0) {
				newOverallScore = maxNE;
				myAuditScoreSets.countNE--;
			} else if (myAuditScoreSets.countIR > 0) {
				newOverallScore = maxIR;
				myAuditScoreSets.countIR--;
			} else if (myAuditScoreSets.countOI > 0) {
				newOverallScore = maxOI;
				myAuditScoreSets.countOI--;
			}
			newOverallScore -= pointsNE * myAuditScoreSets.countNE;
			newOverallScore -= pointsIR * myAuditScoreSets.countIR;
			newOverallScore -= pointsOI * myAuditScoreSets.countOI;
			if (newOverallScore < 0) {
				newOverallScore = 0;
			}
			category.score.percentage = newOverallScore;
        }
    },

    /**
     * calculatorService - used to store the provided calculator service from calculate method so it is available in other methods
     */
    calculatorService: null,

    /*
    * auditScoreSets - custom score values for custom calculations
    */
    auditScoreSets: {
            questionCount: 0,
            pointsDeducted: 0, // start with 0 points deducted
	    	countA: 0, // Acceptable (85% - 100%)
    	    countOI: 0, // Ongoing Improvement (71% - 84%)
        	countIR: 0, // Immediate Resolution (51% - 70%)
        	countNE: 0 // No Exception (0% - 50%)
    }
   
};
