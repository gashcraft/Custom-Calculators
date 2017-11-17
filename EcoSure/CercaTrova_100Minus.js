var CUSTOMCALCULATOR = {
	// CercaTrova_100Minus.js - Cerca Trova's version of the EcoSure 100 Minus Calculator
	// Version 1.0 AKA "Same behavior as EcoSure's 100 Minus"
	// Category Scores range from 0-1% instead of 0-100%.
	// Grand totals for points and total points are percentage based instead of actual points.
	
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
        
        // Set the overall score - "100 Minus"
        // Calculate the point gap (difference between possible and earned)
        // Percentage = 100 minus point gap
        // Normalize possible to 100
        // Earned is also 100 minus point gap
		var pointGap = result.score.possible - result.score.earned;
        result.score.percentage = 100 - pointGap;
        result.score.possible = 100;
        result.score.earned = 100 - pointGap;
        
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
        if (myAuditScoreSets.questionCount > 0 && category.score.possible != 0) {
//        	category.score.percentage = 100 - myAuditScoreSets.pointsDeducted;  
        	category.score.percentage = category.score.earned/ category.score.possible;	      	
//        	category.score.percentage = 100 - (category.score.possible - category.score.earned);	      	
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
