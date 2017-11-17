var CUSTOMCALCULATOR = {
	// EcoSure_100Minus-MA.js - EcoSure 100 Minus Calculator for MA
	// Version 0.90 AKA "First Reference Edition"
	
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
        
        // first it is a good idea to score the result with the standard calculator
        var result = calculatorService.calculateStandardScore(auditResult);
        var parentCategory = null;

		//--------
        //
        // EcoSure 100 Minus custom Score is points deducted from 100.
        //	Scoring defined as: 100 - (points possible - points earned)
        //
        //--------

        this.calculatorService = calculatorService;
        this.auditScoreSets = {
            questionCount: 0, // Number of questions answered
            pointsDeducted: 0 // Start with 0 points deducted
        };

        if (result.categories) {
            for (var i = 0, len = result.categories.length; i < len; i++) {
                var category = result.categories[i];
                this.calculateCategory(category, this.auditScoreSets);
            }
        }
        
        // Set the overall score
//        var newOverallScore = 100 - this.auditScoreSets.pointsDeducted;
//        result.score.percentage = newOverallScore;  // 100 = 100%
        result.score.percentage = 100 - (result.score.possible - result.score.earned);

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
            pointsDeducted: 0 // start with 0 points deducted
        };
        // Collect questions and points for this category
        if (category.questions) {
        	var questions = category.questions;
            for (var i = 0, len = questions.length; i < len; i++) {
                var question = questions[i];
                if (question.answer) {
                    var answer = question.answer; // this.calculatorService.getQuestionResponse(question);
                    if (answer && answer.choice && answer.choice.label) {
						myAuditScoreSets.questionCount += 1;
//			        	var status;
//            			status = question.isAnswerCorrect();
//                    	status = question.isAnswerIncorrect(); 
//			            status = question.isAnswerInformational();
                    	if (answer.choice.label.toUpperCase() === "NO") {
                			if (question.priority) {
								if (question.priority.label.toUpperCase() === "MINOR") {
									myAuditScoreSets.pointsDeducted += 1;
								} else if (question.priority.label.toUpperCase() === "MAJOR") {
									myAuditScoreSets.pointsDeducted += 2;
								} else if (question.priority.label.toUpperCase() === "CRITICAL") {
									if (question.reference && ((question.reference === "8.1.1") || (question.reference === "10.1.1a") || (question.reference === "11.1.1") || (question.reference === "13.1.1"))) {
										myAuditScoreSets.pointsDeducted += 10;	
									} else {
										myAuditScoreSets.pointsDeducted += 3;	
									}
								}
							}
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
        
		// Calculate score for the category; include (any) child questions and points
		//	Only set a percentage if questions existed.
		//	Otherwise no percentage attribute will exist.
        if (myAuditScoreSets.questionCount > 0) {
//        	category.score.percentage = 100 - myAuditScoreSets.pointsDeducted;  
        	category.score.percentage = 100 - (category.score.possible - category.score.earned);	      	
        }

        // Rollup collected questions & points for overall scoring
        auditScoreSets.questionCount += myAuditScoreSets.questionCount;
        auditScoreSets.pointsDeducted += myAuditScoreSets.pointsDeducted;
    },

    /**
     * calculatorService - used to store the provided calculator service from calculate method so it is available in other methods
     */
    calculatorService: null,

    /*
    * auditScoreSets - custom score values for custom calculations
    */
    auditScoreSets: {
        questionCount: 0, // Number of questions answered
        pointsDeducted: 0 // Start with 0 points deducted
    }
   
};
