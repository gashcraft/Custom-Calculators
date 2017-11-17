var EcoSure100Minus = {
    OverallPointsPossible: 100,
    Calculate: function() {
        var scores = new AggregateScores();
        this.AppendAreasToAddress(scores);
        this.AppendReportCategories(scores);
        this.AppendResultCategoriesAndQuestionsAndAuditScores(scores);
        AppState.AuditResult.CalculatedScore = scores;
    },
    GetChildResultCategories: function(categoryGlobalID, duplicateID) {
        var returnValue = [];
        for (var m = 0; m < AppState.AuditResult.Category.length; m++) {
            if (AppState.AuditResult.Category[m].ParentID == categoryGlobalID && AppState.AuditResult.Category[m].ParentDID == duplicateID) {
                returnValue[returnValue.length] = {
                    CGID: AppState.AuditResult.Category[m].CGID,
                    DID: AppState.AuditResult.Category[m].DID
                };
                var result = this.GetChildResultCategories(AppState.AuditResult.Category[m].CGID, AppState.AuditResult.Category[m].DID);
                for (var r = 0; r < result.length; r++) {
                    returnValue[returnValue.length] = {
                        CGID: result[r].CGID,
                        DID: result[r].DID
                    };
                }
            }
        }
        return returnValue;
    },
    AppendQuestions: function(scores, cgid, duplicateID) {
        return;
        var cat = GetCategory(cgid),
            resultCat = GetResultCategory(cgid, duplicateID),
            qScore;
        for (q = 0; q < cat.Question.length; q++) {
            if (resultCat.Question[q].ShowQuestion != "1") continue;
            if (cat.Question[q].Type == QuestionType.Divider) continue;
            qScore = new QuestionScore();
            qScore.CGID = resultCat.CGID;
            qScore.DID = resultCat.DID;
            qScore.QGID = cat.Question[q].QGID;
            if ((cat.Question[q].Type == QuestionType.Radio || cat.Question[q].Type == QuestionType.DropList) && IsQuestionAnswered(resultCat.Question[q])) {
                ch = GetChoice(qScore.CGID, qScore.QGID, resultCat.Question[q].Answer);
                if (ch.PointsEarned != null && ch.PointsEarned != "") qScore.Aggregate.Points.PointsEarned = parseInt(ch.PointsEarned);
                if (ch.PointsPossible != null && ch.PointsPossible != "") qScore.Aggregate.Points.PointsPossible = parseInt(ch.PointsPossible);
                if (ch.RepPointsEarned != null && ch.RepPointsEarned != "") qScore.Aggregate.Points.RepPointsEarned = parseInt(ch.RepPointsEarned);
                if (ch.RepPointsPossible != null && ch.RepPointsPossible != "") qScore.Aggregate.Points.RepPointsPossible = parseInt(ch.RepPointsPossible);
                if (ch.CorrectChoice != null & ch.CorrectChoice != "" && ch.CorrectChoice == "0") qScore.Aggregate.Points.NonCompliantCount = 1;
                if (ch.CorrectChoice != null & ch.CorrectChoice != "" && ch.CorrectChoice == "1") qScore.Aggregate.Points.CompliantCount = 1;
                if (ch.CriticalChoice != null & ch.CriticalChoice != "" && ch.CriticalChoice == "1") qScore.Aggregate.Points.CriticalCount = 1;
                if (ch.ForceFlag != null && ch.ForceFlag != "" && ch.ForceFlag == "7") qScore.Aggregate.ForceFail = 1;
                if (qScore.Aggregate.Points.PointsPossible != 0) qScore.Aggregate.Score.Score = qScore.Aggregate.Points.PointsEarned / qScore.Aggregate.Points.PointsPossible;
                if (qScore.Aggregate.Points.RepPointsPossible != 0) qScore.Aggregate.Score.RepScore = qScore.Aggregate.Points.RepPointsEarned / qScore.Aggregate.Points.RepPointsPossible;
            } else if (cat.Question[q].Type == QuestionType.Spinner && IsQuestionAnswered(resultCat.Question[q]) && cat.Question[q].Condition != undefined && cat.Question[q].Condition.length > 0) {
                for (var n = 0; n < cat.Question[q].Condition.length; n++) {
                    if (AnswerMeetsCondition(resultCat.Question[q].Answer, cat.Question[q].Condition[n])) {
                        if (cat.Question[q].Condition[n].PointsEarned != null && cat.Question[q].Condition[n].PointsEarned != "") qScore.Aggregate.Points.PointsEarned = parseInt(cat.Question[q].Condition[n].PointsEarned);
                        if (cat.Question[q].Condition[n].PointsPossible != null && cat.Question[q].Condition[n].PointsPossible != "") qScore.Aggregate.Points.PointsPossible = parseInt(cat.Question[q].Condition[n].PointsPossible);
                        if (cat.Question[q].Condition[n].CorrectChoice != null & cat.Question[q].Condition[n].CorrectChoice != "" && cat.Question[q].Condition[n].CorrectChoice == "0") qScore.Aggregate.Points.NonCompliantCount = 1;
                        if (cat.Question[q].Condition[n].CorrectChoice != null & cat.Question[q].Condition[n].CorrectChoice != "" && cat.Question[q].Condition[n].CorrectChoice == "1") qScore.Aggregate.Points.CompliantCount = 1;
                        if (cat.Question[q].Condition[n].CriticalChoice != null & cat.Question[q].Condition[n].CriticalChoice != "" && cat.Question[q].Condition[n].CriticalChoice == "1") qScore.Aggregate.Points.CriticalCount = 1;
                        if (cat.Question[q].Condition[n].ForceFlag != null && cat.Question[q].Condition[n].ForceFlag != "" && cat.Question[q].Condition[n].ForceFlag == "7") qScore.Aggregate.ForceFail = 1;
                        if (qScore.Aggregate.Points.PointsPossible != 0) qScore.Aggregate.Score.Score = qScore.Aggregate.Points.PointsEarned / qScore.Aggregate.Points.PointsPossible;
                        if (qScore.Aggregate.Points.RepPointsPossible != 0) qScore.Aggregate.Score.RepScore = qScore.Aggregate.Points.RepPointsEarned / qScore.Aggregate.Points.RepPointsPossible;
                        break;
                    }
                }
            } else if ((cat.Question[q].Type == QuestionType.Text && cat.Question[q].DataType == "1") && IsQuestionAnswered(resultCat.Question[q]) && cat.Question[q].Condition != undefined && cat.Question[q].Condition.length > 0) {
                for (var n = 0; n < cat.Question[q].Condition.length; n++) {
                    if (AnswerMeetsCondition(resultCat.Question[q].Answer, cat.Question[q].Condition[n])) {
                        if (cat.Question[q].Condition[n].PointsEarned != null && cat.Question[q].Condition[n].PointsEarned != "") qScore.Aggregate.Points.PointsEarned = parseInt(cat.Question[q].Condition[n].PointsEarned);
                        if (cat.Question[q].Condition[n].PointsPossible != null && cat.Question[q].Condition[n].PointsPossible != "") qScore.Aggregate.Points.PointsPossible = parseInt(cat.Question[q].Condition[n].PointsPossible);
                        if (cat.Question[q].Condition[n].CorrectChoice != null & cat.Question[q].Condition[n].CorrectChoice != "" && cat.Question[q].Condition[n].CorrectChoice == "0") qScore.Aggregate.Points.NonCompliantCount = 1;
                        if (cat.Question[q].Condition[n].CorrectChoice != null & cat.Question[q].Condition[n].CorrectChoice != "" && cat.Question[q].Condition[n].CorrectChoice == "1") qScore.Aggregate.Points.CompliantCount = 1;
                        if (cat.Question[q].Condition[n].CriticalChoice != null & cat.Question[q].Condition[n].CriticalChoice != "" && cat.Question[q].Condition[n].CriticalChoice == "1") qScore.Aggregate.Points.CriticalCount = 1;
                        if (cat.Question[q].Condition[n].ForceFlag != null && cat.Question[q].Condition[n].ForceFlag != "" && cat.Question[q].Condition[n].ForceFlag == "7") qScore.Aggregate.ForceFail = 1;
                        if (qScore.Aggregate.Points.PointsPossible != 0) qScore.Aggregate.Score.Score = qScore.Aggregate.Points.PointsEarned / qScore.Aggregate.Points.PointsPossible;
                        if (qScore.Aggregate.Points.RepPointsPossible != 0) qScore.Aggregate.Score.RepScore = qScore.Aggregate.Points.RepPointsEarned / qScore.Aggregate.Points.RepPointsPossible;
                        break;
                    }
                }
            } else {
                qScore.Aggregate.Points.PointsEarned = NaN;
                qScore.Aggregate.Points.PointsPossible = NaN;
                qScore.Aggregate.Points.RepPointsEarned = NaN;
                qScore.Aggregate.Points.RepPointsPossible = NaN;
                qScore.Aggregate.Score.Score = NaN;
                qScore.Aggregate.Score.RepScore = NaN;
            }
            scores.Questions[scores.Questions.length] = qScore;
        }
    },
    AppendChildResultCategories: function(scores, parentCGID, parentDID) {
        var children = this.GetChildResultCategories(parentCGID, parentDID),
            points, catScore;
        for (var c = 0; c < children.length; c++) {
            points = GetResultCategoryPoints(children[c].CGID, children[c].DID, true, true);
            catScore = new CategoryScore();
            catScore.CGID = children[c].CGID;
            catScore.DID = children[c].DID;
            catScore.Aggregate.Points.PointsEarned = points.PointsEarned;
            catScore.Aggregate.Points.PointsPossible = points.PointsPossible;
            catScore.Aggregate.Points.RepPointsEarned = points.RepPointsEarned;
            catScore.Aggregate.Points.RepPointsPossible = points.RepPointsPossible;
            catScore.Aggregate.Points.ForceFail = points.AuditForceFail;
            catScore.Aggregate.Points.ForcePass = points.AuditForcePass;
            catScore.Aggregate.Points.CompliantCount = points.CompliantCount;
            catScore.Aggregate.Points.NonCompliantCount = points.NonCompliantCount;
            catScore.Aggregate.Points.CriticalCount = points.CriticalCount;
            if (points.PointsPossible != 0) catScore.Aggregate.Score.Score = points.PointsEarned / points.PointsPossible;
            if (points.RepPointsPossible != 0) catScore.Aggregate.Score.RepScore = points.RepPointsEarned / points.RepPointsPossible;
            scores.Categories[scores.Categories.length] = catScore;
            this.AppendQuestions(scores, catScore.CGID, catScore.DID);
        }
    },
    AppendReportCategories: function(scores) {
        var rcScore, pointsEarned = 0,
            pointsPossible = 0,
            repPointsEarned = 0,
            repPointsPossible = 0,
            compliantCount = 0,
            nonCompliantCount = 0,
            criticalCount = 0;
        for (var r = 0; r < mAuditForm.ReportCategory.length; r++) {
            for (var a = 0; a < scores.AreasToAddress.length; a++) {
                if (scores.AreasToAddress[a].RCID == undefined || scores.AreasToAddress[a].RCID != mAuditForm.ReportCategory[r].ID) continue;
                if ((scores.AreasToAddress[a].Aggregate.Points.CompliantCount > 0) && (scores.AreasToAddress[a].Aggregate.Points.NonCompliantCount == 0)) compliantCount++;
                if (scores.AreasToAddress[a].Aggregate.Points.CriticalCount > 0) criticalCount++;
                if (scores.AreasToAddress[a].Aggregate.Points.NonCompliantCount > 0) nonCompliantCount++;
                pointsEarned += scores.AreasToAddress[a].Aggregate.Points.PointsEarned;
                pointsPossible += scores.AreasToAddress[a].Aggregate.Points.PointsPossible;
                repPointsEarned += scores.AreasToAddress[a].Aggregate.Points.RepPointsEarned;
                repPointsPossible += scores.AreasToAddress[a].Aggregate.Points.RepPointsPossible;
            }
            rcScore = new ReportCategoryScore();
            rcScore.RCID = mAuditForm.ReportCategory[r].ID;
            rcScore.Aggregate.Points.PointsEarned = pointsEarned;
            rcScore.Aggregate.Points.PointsPossible = pointsPossible;
            rcScore.Aggregate.Points.RepPointsEarned = repPointsEarned;
            rcScore.Aggregate.Points.RepPointsPossible = repPointsPossible;
            rcScore.Aggregate.Points.CompliantCount = compliantCount;
            rcScore.Aggregate.Points.NonCompliantCount = nonCompliantCount;
            rcScore.Aggregate.Points.CriticalCount = criticalCount;
            if ((compliantCount + nonCompliantCount) != 0) rcScore.Aggregate.Score.Score = this.roundDecimals(pointsEarned / pointsPossible, 3) * 100;
            if (repPointsPossible != 0) rcScore.Aggregate.Score.RepScore = repPointsEarned / repPointsPossible;
            scores.ReportCategories[scores.ReportCategories.length] = rcScore;
            pointsEarned = 0, pointsPossible = 0, repPointsEarned = 0, repPointsPossible = 0, compliantCount = 0, nonCompliantCount = 0, criticalCount = 0;
        }
    },
    AppendAreasToAddress: function(scores) {
        var atoaScore, ch, cat, pointsEarned = 0,
            pointsPossible = 0,
            repPointsEarned = 0,
            repPointsPossible = 0,
            compliantCount = 0,
            tmpPointsEarned = [],
            nonCompliantCount = 0,
            criticalCount = 0;
        for (var a = 0; a < mAuditForm.AreaToAddress.length; a++) {
            for (var c = 0; c < AppState.AuditResult.Category.length; c++) {
                cat = GetCategory(AppState.AuditResult.Category[c].CGID);
                for (var q = 0; q < cat.Question.length; q++) {
                    if (AppState.AuditResult.Category[c].Question[q].ShowQuestion != "1") continue;
                    if (cat.Question[q].Type == QuestionType.Divider) continue;
                    if (cat.Question[q].AreaToAddressID != mAuditForm.AreaToAddress[a].ID) continue;
                    if ((cat.Question[q].Type == QuestionType.Radio || cat.Question[q].Type == QuestionType.DropList) && IsQuestionAnswered(AppState.AuditResult.Category[c].Question[q])) {
                        ch = GetChoice(cat.CGID, cat.Question[q].QGID, AppState.AuditResult.Category[c].Question[q].Answer);
                        if (ch.PointsPossible != null && ch.PointsPossible != "") pointsPossible = Math.max(parseInt(ch.PointsPossible), pointsPossible);
                        if (ch.RepPointsEarned != null && ch.RepPointsEarned != "") repPointsEarned += parseInt(ch.RepPointsEarned);
                        if (ch.RepPointsPossible != null && ch.RepPointsPossible != "") repPointsPossible += parseInt(ch.RepPointsPossible);
                        if (ch.CorrectChoice != null & ch.CorrectChoice != "" && ch.CorrectChoice == "0") {
                            if (ch.PointsEarned != null && ch.PointsEarned != "") tmpPointsEarned.push(parseInt(ch.PointsEarned));
                            nonCompliantCount++;
                        }
                        if (ch.CorrectChoice != null & ch.CorrectChoice != "" && ch.CorrectChoice == "1") {
                            if (ch.PointsEarned != null && ch.PointsEarned != "") tmpPointsEarned.push(parseInt(ch.PointsEarned));
                            compliantCount++;
                        }
                        if (ch.CriticalChoice != null & ch.CriticalChoice != "" && ch.CriticalChoice == "True") criticalCount++;
                    } else if ((cat.Question[q].Type == QuestionType.Spinner || (cat.Question[q].Type == QuestionType.Text && cat.Question[q].DataType == "1") || cat.Question[q].Type == QuestionType.Temperature) && IsQuestionAnswered(AppState.AuditResult.Category[c].Question[q]) && cat.Question[q].Condition != undefined && cat.Question[q].Condition.length > 0) {
                        for (var n = 0; n < cat.Question[q].Condition.length; n++) {
                            if (AnswerMeetsCondition(AppState.AuditResult.Category[c].Question[q].Answer, cat.Question[q].Condition[n])) {
                                if (cat.Question[q].Condition[n].PointsPossible != null && cat.Question[q].Condition[n].PointsPossible != "") pointsPossible = Math.max(parseInt(cat.Question[q].Condition[n].PointsPossible), pointsPossible);
                                if (cat.Question[q].Condition[n].CorrectChoice != null & cat.Question[q].Condition[n].CorrectChoice != "" && cat.Question[q].Condition[n].CorrectChoice == "0") nonCompliantCount++;
                                if (cat.Question[q].Condition[n].CorrectChoice != null & cat.Question[q].Condition[n].CorrectChoice != "" && cat.Question[q].Condition[n].CorrectChoice == "1") compliantCount++;
                                if (cat.Question[q].Condition[n].CriticalChoice != null & cat.Question[q].Condition[n].CriticalChoice != "" && cat.Question[q].Condition[n].CriticalChoice == "True") criticalCount++;
                                break;
                            }
                        }
                    }
                }
            }
            atoaScore = new AreaToAddressScore();
            atoaScore.RCID = mAuditForm.AreaToAddress[a].ReportCategoryID;
            atoaScore.AtoAID = mAuditForm.AreaToAddress[a].ID;
            atoaScore.Aggregate.Points.CompliantCount = compliantCount;
            atoaScore.Aggregate.Points.NonCompliantCount = nonCompliantCount;
            atoaScore.Aggregate.Points.CriticalCount = criticalCount;
            atoaScore.Aggregate.Points.PointsEarned = parseInt(this.minOfArray(tmpPointsEarned));
            atoaScore.Aggregate.Points.PointsPossible = pointsPossible;
            atoaScore.Aggregate.Points.RepPointsEarned = repPointsEarned;
            atoaScore.Aggregate.Points.RepPointsPossible = repPointsPossible;
            if (pointsPossible != 0) atoaScore.Aggregate.Score.Score = pointsEarned / pointsPossible;
            if (repPointsPossible != 0) atoaScore.Aggregate.Score.RepScore = repPointsEarned / repPointsPossible;
            scores.AreasToAddress[scores.AreasToAddress.length] = atoaScore;
            tmpPointsEarned = [], pointsEarned = 0, pointsPossible = 0, repPointsEarned = 0, repPointsPossible = 0, compliantCount = 0, nonCompliantCount = 0, criticalCount = 0;
        }
    },
    AppendResultCategoriesAndQuestionsAndAuditScores: function(scores) {
        var rcReference, points, catScore, pointsEarned = 0,
            pointsPossible = 0,
            repPointsEarned = 0,
            repPointsPossible = 0,
            compliantCount = 0,
            nonCompliantCount = 0,
            criticalCount = 0;
        scores.ARGID = AppState.Setting.AuditResultGlobalID;
        scores.ARID = AppState.Setting.AuditResultID;
        for (var m = 0; m < AppState.AuditResult.Category.length; m++) {
            if (AppState.AuditResult.Category[m].ParentID == undefined || AppState.AuditResult.Category[m].ParentID == null || AppState.AuditResult.Category[m].ParentID == "") {
                points = GetResultCategoryPoints(AppState.AuditResult.Category[m].CGID, AppState.AuditResult.Category[m].DID, true, true);
                catScore = new CategoryScore();
                catScore.CGID = AppState.AuditResult.Category[m].CGID;
                catScore.DID = AppState.AuditResult.Category[m].DID;
                catScore.Aggregate.Points.PointsEarned = points.PointsEarned;
                catScore.Aggregate.Points.PointsPossible = points.PointsPossible;
                catScore.Aggregate.Points.RepPointsEarned = points.RepPointsEarned;
                catScore.Aggregate.Points.RepPointsPossible = points.RepPointsPossible;
                catScore.Aggregate.Points.ForceFail = points.AuditForceFail;
                catScore.Aggregate.Points.ForcePass = points.AuditForcePass;
                catScore.Aggregate.Points.CompliantCount = points.CompliantCount;
                catScore.Aggregate.Points.NonCompliantCount = points.NonCompliantCount;
                catScore.Aggregate.Points.CriticalCount = points.CriticalCount;
                if (points.PointsPossible != 0) catScore.Aggregate.Score.Score = points.PointsEarned / points.PointsPossible;
                if (points.RepPointsPossible != 0) catScore.Aggregate.Score.RepScore = points.RepPointsEarned / points.RepPointsPossible;
                scores.Categories[scores.Categories.length] = catScore;
                this.AppendQuestions(scores, catScore.CGID, catScore.DID);
                this.AppendChildResultCategories(scores, catScore.CGID, catScore.DID);
            }
        }
        for (var r = 0; r < scores.ReportCategories.length; r++) {
            pointsEarned += scores.ReportCategories[r].Aggregate.Points.PointsEarned;
            pointsPossible += scores.ReportCategories[r].Aggregate.Points.PointsPossible;
            repPointsEarned += scores.ReportCategories[r].Aggregate.Points.RepPointsEarned;
            repPointsPossible += scores.ReportCategories[r].Aggregate.Points.RepPointsPossible;
            compliantCount += scores.ReportCategories[r].Aggregate.Points.CompliantCount;
            nonCompliantCount += scores.ReportCategories[r].Aggregate.Points.NonCompliantCount;
            criticalCount += scores.ReportCategories[r].Aggregate.Points.CriticalCount;
        }
        scores.Aggregate.Points.PointsEarned = 100 - (pointsPossible - pointsEarned);
        scores.Aggregate.Points.PointsPossible = this.OverallPointsPossible;
        scores.Aggregate.Points.RepPointsEarned = repPointsEarned;
        scores.Aggregate.Points.RepPointsPossible = repPointsPossible;
        scores.Aggregate.Points.CompliantCount = compliantCount;
        scores.Aggregate.Points.NonCompliantCount = nonCompliantCount;
        scores.Aggregate.Points.CriticalCount = criticalCount;
        if (scores.Aggregate.Points.PointsPossible != 0 && scores.Aggregate.Points.PointsPossible != undefined) {
            if ((scores.Aggregate.Points.PointsEarned / scores.Aggregate.Points.PointsPossible) > 0) {
                scores.Aggregate.Score.Score = (this.OverallPointsPossible - (pointsPossible - pointsEarned)) / 100;
                if (scores.Aggregate.Points.RepPointsPossible != 0 && scores.Aggregate.Points.RepPointsPossible != undefined) {
                    scores.Aggregate.Score.RepScore = scores.Aggregate.Points.RepPointsEarned / scores.Aggregate.Points.RepPointsPossible;
                } else {
                    scores.Aggregate.Score.RepScore = 0;
                }
            } else {
                scores.Aggregate.Score.Score = 0;
            }
            scores.Aggregate.Score.WeightedScore = null;
        }
        scores.Aggregate.Rating.RatingLevelID = this.getRatingbyReferenceAndRCID(scores.Aggregate.Score.Score * 100);
    },
    getRatingbyReferenceAndRCID: function(value, RCID) {
        var RatingID;
        if (RCID != null || RCID != undefined) {
            for (var rc = 0; rc < mAuditForm.ReportCategory.length; rc++) {
                if (mAuditForm.ReportCategory[rc].ID != RCID) continue;
                for (var rr = 0; rr < mAuditForm.ReportCategory[rc].Rating.length; rr++) {
                    if (mAuditForm.ReportCategory[rc].Rating[rr].PercentHigh >= value && mAuditForm.ReportCategory[rc].Rating[rr].PercentLow <= value) {
                        RatingID = mAuditForm.ReportCategory[rc].Rating[rr].RatingLevelGlobalID;
                        break;
                    }
                }
            }
        } else {
            for (var r = 0; r < mAuditForm.Rating.length; r++) {
                if (mAuditForm.Rating[r].PercentHigh >= value && mAuditForm.Rating[r].PercentLow <= value) {
                    RatingID = mAuditForm.Rating[r].RatingLevelID;
                    break;
                }
            }
        }
        return RatingID;
    },
    roundDecimals: function(number, decimalplace) {
        var temp = 0;
        temp = Math.round(number * Math.pow(10, decimalplace));
        temp = temp / Math.pow(10, decimalplace);
        return temp;
    },
    minOfArray: function(Array) {
        var valueHolder = 0;
        for (var i = 0; i < Array.length; i++) {
            if (i == 0) {
                valueHolder = Array[i];
            } else {
                valueHolder = Math.min(Array[i], valueHolder);
            }
        }
        return valueHolder;
    },
    getRCReferencebyRCID: function(RCID) {
        for (var rc = 0; rc < mAuditForm.ReportCategory.length; rc++) {
            if (RCID == mAuditForm.ReportCategory[rc].ID) {
                return mAuditForm.ReportCategory[rc].Reference;
            } else {
                continue
            };
        }
    }
};
RegisterCalculator({
    CalculatorName: "EcoSure Standard 100 Minus Calculator",
    CalculatorObject: EcoSure100Minus
});
