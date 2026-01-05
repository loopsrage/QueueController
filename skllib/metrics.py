import numpy as np
from matplotlib import pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.figure import Figure
from sklearn.inspection import permutation_importance
from sklearn.metrics import PredictionErrorDisplay, ConfusionMatrixDisplay, r2_score, root_mean_squared_error, \
    mean_absolute_percentage_error, matthews_corrcoef, balanced_accuracy_score


def hist_gradient_classifier_charts(model, data, target):
    fig, axs = plt.subplots(nrows=1, ncols=4, figsize=(20, 6))
    PredictionErrorDisplay.from_estimator(
        model, data, target, kind="actual_vs_predicted", ax=axs[0]
    )
    axs[0].set_title("Actual vs. Predicted")

    PredictionErrorDisplay.from_estimator(
        model, data, target, kind="residual_vs_predicted", ax=axs[1]
    )
    axs[1].set_title("Residuals Plot")

    result = permutation_importance(model, data, target, n_repeats=10, random_state=0)
    sorted_idx = result.importances_mean.argsort()
    axs[2].boxplot(
        result.importances[sorted_idx].T,
        vert=False,
        labels=data.columns[sorted_idx]
    )
    axs[2].set_title("Permutation Importance")
    axs[2].set_xlabel("Decrease in Score")
    ConfusionMatrixDisplay.from_estimator(model, data, target, ax=axs[3])
    axs[3].set_title("Confusion Matrix")
    plt.tight_layout()
    plt.show()

def hist_gradient_regression_charts(model, data, predictions, target, sns=None):
    fig = Figure(figsize=(24, 6))
    canvas = FigureCanvasAgg(fig)
    axs = fig.subplots(nrows=1, ncols=4)

    try:
        # 1. Actual vs Predicted (Works for Regression)
        PredictionErrorDisplay.from_estimator(
            model, data, target, kind="actual_vs_predicted", ax=axs[0]
        )
        axs[0].set_title("Actual vs. Predicted")

        # 2. Residuals vs Predicted (Works for Regression)
        PredictionErrorDisplay.from_estimator(
            model, data, target, kind="residual_vs_predicted", ax=axs[1]
        )
        axs[1].set_title("Residuals Plot")

        # 3. Permutation Importance (Works for Regression)
        result = permutation_importance(model, data, target, n_repeats=10, random_state=0)
        sorted_idx = result.importances_mean.argsort()
        axs[2].boxplot(
            result.importances[sorted_idx].T,
            vert=False,
            tick_labels=data.columns[sorted_idx]  # Note: labels changed to tick_labels in recent matplotlib
        )
        axs[2].set_title("Permutation Importance (R² Score)")

        # 4. Replacement for Confusion Matrix: Residual Histogram
        # This shows if your errors are normally distributed (ideal for regression)
        y_pred = model.predict(data)
        residuals = target - y_pred
        sns.histplot(residuals, kde=True, ax=axs[3])
        axs[3].set_title("Residuals Distribution")
        axs[3].set_xlabel("Error (Actual - Predicted)")
    except Exception:
        raise
    finally:
        # Critical for memorymanagement
        fig.clear()
        for a in axs:
            a.clear()
        del fig, axs

def hist_gradient_regression_metrics(targets, initial_predictions, predictions, residuals=None):
    if initial_predictions is None:
        # Create a baseline that predicts the mean for every row
        initial_predictions = np.full(targets.shape, targets.mean(axis=0).values)

    return {
        "initial_score":   float(r2_score(targets, initial_predictions)),
        "final_score": float(r2_score(targets, predictions)),
        "rmse": float(root_mean_squared_error(targets, predictions)),
        "mape": float(mean_absolute_percentage_error(targets, predictions)),
        "residual_mean": float(np.mean(residuals))
    }

def hist_gradient_classifier_metrics(targets, initial_predictions, predictions):
    cols = targets.columns if hasattr(targets, 'columns') else [0]

    mcc_list = []

    for i, col in enumerate(cols):
        # Extract 1D arrays for the current target
        y_true = targets[col] if len(cols) > 1 else targets
        y_pred = predictions[col] if len(cols) > 1 else predictions

        # mcc
        mcc_list.append(matthews_corrcoef(y_true, y_pred))

    return {
        "initial_score": float(balanced_accuracy_score(targets, initial_predictions)),
        "final_score": float(balanced_accuracy_score(targets, predictions)),
        "mcc": float(np.mean(mcc_list)),
    }