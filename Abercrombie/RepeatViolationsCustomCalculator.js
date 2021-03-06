var CUSTOMCALCULATOR = {
	// Revision History
	// Version 1.0 - Incomplete; assumed that the audit results contained information about repeat violation (it doesn't.)
	// --------- Now Repeat Violations Custom Calculator for Abercrombie
	// Version 2.1 - Skipped forcing score (percentage)=0 on category if there are no scoring questions
	// Version 2.0 - This one actually (will) work
	// Version 1.0 - Curtis' Very First MA Custom Calculator: One Line o' Code
	
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
        
        // first it is a good idea to score the result with the standard calculator
        var result = calculatorService.calculateStandardScore(auditResult);
        var parentCategory = null;

		//--------
        // We are going to look for any Repeat Audit score that is negative
        //     answer->choice->repeatEarned
        // If I see one I'm going to set the final score to ZERO regardless
        //--------

        this.calculatorService = calculatorService;
        this.auditScoreSets = {
            repeatViolation: 0
        };

        if (result.categories) {
            for (var i = 0, len = result.categories.length; i < len; i++) {
                var category = result.categories[i];
                this.calculateCategory(category, this.auditScoreSets);
            }
        }
        
        // Look for repeat Violation Flag, zero the overall score if found.
        if (this.auditScoreSets.repeatViolation) {
			result.score.percentage = 0;
        }
        
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
        myAuditScoreSets = {
            repeatViolation: 0
        };
        // Collect questions and points for this category
        if (category.questions) {
        	var questions = category.questions;
            for (var i = 0, len = questions.length; i < len; i++) {
                var question = questions[i];
                if (question.answer) {
                    var answer = this.calculatorService.getQuestionResponse(question);
                    if (answer && answer.repeatEarned) {
                        if (answer.repeatEarned < 0) {
                        	myAuditScoreSets.repeatViolation = 1;
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
        
        // Rollup collected repeat violation status for overall
        auditScoreSets.repeatViolation += myAuditScoreSets.repeatViolation;
    },

    /**
     * calculatorService - used to store the provided calculator service from calculate method so it is available in other methods
     */
    calculatorService: null,

    /*
    * auditScoreSets - custom score values for custom calculations
    */
    auditScoreSets: {
        repeatViolation: 0
    }
   
};
