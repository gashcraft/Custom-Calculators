var CUSTOMCALCULATOR = {
	// ASI-CustomScore.js - Custom Scoring For ASI
	// Version 0.1 AKA "First Draft"
	
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
    	// Global 'Constants'
        pointsExemption = 0;	// 0% off
    	pointsCompliant = 0;	// 0% off
        pointsMinor = 1;		// 1% off
        pointsMajor = 10;		// 10% off
        pointsCritical = 50;	// 50% off

        // first it is a good idea to score the result with the standard calculator
        var result = calculatorService.calculateStandardScore(auditResult);
        var parentCategory = null;

		//--------
		// All audits are scored with the following system:
		//  
		// Starting grade is always 100%
		//  
		// Each minors is -1%
		// Each major is -10%
		// Each critical is -50%
		// OIP/NA/Exempt are -0%
		//  
		// For example: If a facility receives 1 major and 3 minors, they should have a final score of a 87%.
		// 
        //--------

        this.calculatorService = calculatorService;
        this.auditScoreSets = {
            questionCount: 0, 	// Number of questions answered
            pointsDeducted: 0, 	// Start with 0 points deducted
	    	countExemption: 0, 	// Counted, no deduction
    	    countCompliant: 0, 	// Counted, no deduction
        	countMinor: 0, 		// 1%
        	countMajor: 0, 		// 10%
        	countCritical: 0 	// 50%
        };

        if (result.categories) {
            for (var i = 0, len = result.categories.length; i < len; i++) {
                var category = result.categories[i];
                this.calculateCategory(category, this.auditScoreSets);
            }
        }
        
        // Set the overall score
        var newOverallScore = 100;
        newOverallScore -= pointsMinor * this.auditScoreSets.countMinor;
        newOverallScore -= pointsMajor * this.auditScoreSets.countMajor;
        newOverallScore -= pointsCritical * this.auditScoreSets.countCritical;
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
	    	countExemption: 0, // A - Acceptable (85% - 100%)
	    	countCompliant: 0, // A - Acceptable (85% - 100%)
    	    countMinor: 0, // OI - Ongoing Improvement (71% - 84%)
        	countMajor: 0, // IR - Immediate Resolution (51% - 70%)
        	countCritical: 0 // NE - No Exception (0% - 50%)
        };
        // Collect questions and points for this category
        if (category.questions) {
        	var questions = category.questions;
            for (var i = 0, len = questions.length; i < len; i++) {
                var question = questions[i];
                if (question.answer) {
                    var answer = question.answer; // this.calculatorService.getQuestionResponse(question);
                    if (answer && answer.choice && answer.choice.label) {
                    	if (answer.choice.label.toUpperCase() === "EXEMPTION") {
                			myAuditScoreSets.countExemption++;
							myAuditScoreSets.questionCount += 1;
						} else if (answer.choice.label.toUpperCase() === "COMPLIANT") {
                			myAuditScoreSets.countCompliant++;
							myAuditScoreSets.questionCount += 1;
						} else if (answer.choice.label.toUpperCase() === "MINOR") {
                			myAuditScoreSets.countMinor++;
							myAuditScoreSets.questionCount += 1;
						} else if (answer.choice.label.toUpperCase() === "MAJOR") {
                			myAuditScoreSets.countMajor++;
							myAuditScoreSets.questionCount += 1;
						} else if (answer.choice.label.toUpperCase() === "CRITICAL") {
                			myAuditScoreSets.countCritical++;
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
        auditScoreSets.countExemption += myAuditScoreSets.countExemption;
        auditScoreSets.countCompliant += myAuditScoreSets.countCompliant;
        auditScoreSets.countMinor += myAuditScoreSets.countMinor;
        auditScoreSets.countMajor += myAuditScoreSets.countMajor;
        auditScoreSets.countCritical += myAuditScoreSets.countCritical;
        
		// Calculate score for the category; include (any) child questions and points
		//	Only set a percentage if questions existed.
		//	Otherwise no percentage attribute will exist.
        if (myAuditScoreSets.questionCount > 0) {
			// Set the overall score
			newOverallScore = 100;
			newOverallScore -= pointsMinor * myAuditScoreSets.countMinor;
			newOverallScore -= pointsMajor * myAuditScoreSets.countMajor;
			newOverallScore -= pointsCritical * myAuditScoreSets.countCritical;
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
	    	countExemption: 0, 	// Counted, no deduction
    	    countCompliant: 0, 	// Counted, no deduction
        	countMinor: 0, 		// 1%
        	countMajor: 0, 		// 10%
        	countCritical: 0 	// 50%
    }
   
};
