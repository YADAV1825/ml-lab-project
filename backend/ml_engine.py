import pandas as pd
import numpy as np
from sklearn.datasets import load_iris, load_diabetes, load_wine, load_breast_cancer, make_classification, make_regression, make_blobs
from sklearn.model_selection import train_test_split, GridSearchCV, learning_curve
from sklearn.metrics import accuracy_score, mean_squared_error, confusion_matrix, precision_score, recall_score, f1_score, r2_score, mean_absolute_error, roc_auc_score, roc_curve, auc
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.svm import SVC, SVR
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder, KBinsDiscretizer
import matplotlib.pyplot as plt
from sklearn.tree import plot_tree
import io
import base64

# Global state to store uploaded/generated datasets
datasets_store = {}

def load_builtin_dataset(name):
    if name == 'iris':
        data = load_iris()
    elif name == 'diabetes':
        data = load_diabetes()
    elif name == 'wine':
        data = load_wine()
    elif name == 'breast_cancer':
        data = load_breast_cancer()
    else:
        raise ValueError("Unknown dataset")
    
    df = pd.DataFrame(data.data, columns=data.feature_names)
    df['target'] = data.target
    return df, data.target_names if hasattr(data, 'target_names') else None

def generate_synthetic_dataset(type, n_samples=500, n_features=2):
    if type == 'classification':
        X, y = make_classification(n_samples=n_samples, n_features=n_features, n_informative=2, n_redundant=0, random_state=42)
    elif type == 'regression':
        X, y = make_regression(n_samples=n_samples, n_features=n_features, noise=0.1, random_state=42)
    elif type == 'clustering':
        X, y = make_blobs(n_samples=n_samples, n_features=n_features, centers=3, random_state=42)
    else:
        raise ValueError("Unknown synthetic type")
    
    columns = [f'feature_{i}' for i in range(n_features)]
    df = pd.DataFrame(X, columns=columns)
    df['target'] = y
    return df

def get_model(model_name, task_type, params):
    if model_name == 'Linear Regression':
        return LinearRegression(**params)
    elif model_name == 'Logistic Regression':
        return LogisticRegression(max_iter=1000, **params)
    elif model_name == 'Decision Tree':
        return DecisionTreeClassifier(**params) if task_type == 'classification' else DecisionTreeRegressor(**params)
    elif model_name == 'Random Forest':
        return RandomForestClassifier(**params) if task_type == 'classification' else RandomForestRegressor(**params)
    elif model_name == 'KNN':
        return KNeighborsClassifier(**params) if task_type == 'classification' else KNeighborsRegressor(**params)
    elif model_name == 'SVM':
        return SVC(probability=True, **params) if task_type == 'classification' else SVR(**params)
    elif model_name == 'K-Means':
        return KMeans(**params)
    else:
        raise ValueError("Unknown model")

def train_model(dataset_id, target_col, model_name, task_type, test_size=0.2, params=None, tune=False):
    if dataset_id not in datasets_store:
        raise ValueError("Dataset not found")
        
    df = datasets_store[dataset_id]
    if target_col not in df.columns:
        raise ValueError(f"Target column {target_col} not found in dataset")
        
    # Drop rows where target is NaN
    df = df.dropna(subset=[target_col])

    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    if task_type != 'clustering':
        if model_name in ['Linear Regression']:
            task_type = 'regression'
        elif model_name in ['Logistic Regression']:
            task_type = 'classification'
        else:
            if y.dtype == 'object' or y.dtype.name == 'category' or len(y.unique()) < 15:
                task_type = 'classification'
            else:
                task_type = 'regression'
                
        if task_type == 'classification':
            if pd.api.types.is_numeric_dtype(y) and len(y.unique()) > 20:
                est = KBinsDiscretizer(n_bins=3, encode='ordinal', strategy='quantile')
                y = est.fit_transform(y.values.reshape(-1, 1)).flatten()
            else:
                le = LabelEncoder()
                y = le.fit_transform(y)
        elif task_type == 'regression':
            if not pd.api.types.is_numeric_dtype(y):
                le = LabelEncoder()
                y = le.fit_transform(y)
    
    # Identify numeric and categorical columns
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
    categorical_features = X.select_dtypes(include=['object', 'category', 'string']).columns
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='mean')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ], remainder='passthrough')
    
    base_model = get_model(model_name, task_type, params or {})
    
    model = Pipeline(steps=[('preprocessor', preprocessor),
                            ('classifier', base_model)])
    
    if task_type == 'clustering':
        model.fit(X)
        y_pred = model.predict(X)
        return {
            'labels': y_pred.tolist(),
            'inertia': getattr(base_model, 'inertia_', None),
            'cluster_centers': getattr(base_model, 'cluster_centers_', None).tolist() if hasattr(base_model, 'cluster_centers_') else None
        }
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    
    if tune:
        # Simplistic grid search for demonstration
        param_grid = {}
        if model_name in ['Random Forest', 'Decision Tree']:
            param_grid = {'classifier__max_depth': [None, 5, 10, 20]}
        elif model_name in ['SVM', 'Logistic Regression']:
            param_grid = {'classifier__C': [0.1, 1.0, 10.0]}
        
        if param_grid:
            grid = GridSearchCV(model, param_grid, cv=3)
            grid.fit(X_train, y_train)
            model = grid.best_estimator_
            params = grid.best_params_
        else:
            model.fit(X_train, y_train)
    else:
        model.fit(X_train, y_train)
        
    y_pred = model.predict(X_test)
    
    results = {
        'params_used': params,
        'task_type': task_type,
        'actual': y_test.tolist()[:100],
        'predicted': y_pred.tolist()[:100]
    }
    
    if task_type == 'classification':
        results['accuracy'] = accuracy_score(y_test, y_pred)
        results['precision'] = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        results['recall'] = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        results['f1'] = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        results['confusion_matrix'] = confusion_matrix(y_test, y_pred).tolist()
        
        # Try ROC AUC if possible (binary/multiclass with proba)
        try:
            if hasattr(model, "predict_proba"):
                y_prob = model.predict_proba(X_test)
                if len(np.unique(y)) == 2:
                    results['roc_auc'] = roc_auc_score(y_test, y_prob[:, 1])
                else:
                    results['roc_auc'] = roc_auc_score(y_test, y_prob, multi_class='ovr')
        except:
            pass
    else:
        results['mse'] = mean_squared_error(y_test, y_pred)
        results['r2'] = r2_score(y_test, y_pred)
        results['mae'] = mean_absolute_error(y_test, y_pred)
        
    # Generate Advanced Plots
    
    # 1. Learning Curve (All Models)
    try:
        train_sizes, train_scores, test_scores = learning_curve(
            model, X, y, cv=3, n_jobs=-1, train_sizes=np.linspace(0.1, 1.0, 5),
            scoring='accuracy' if task_type == 'classification' else 'neg_mean_squared_error'
        )
        train_scores_mean = np.mean(train_scores, axis=1)
        test_scores_mean = np.mean(test_scores, axis=1)
        
        if task_type != 'classification':
            train_scores_mean = -train_scores_mean
            test_scores_mean = -test_scores_mean
            
        plt.figure(figsize=(8, 5), dpi=200)
        plt.title("Learning Curve")
        plt.xlabel("Training Examples")
        plt.ylabel("Score" if task_type == 'classification' else "Error (MSE)")
        plt.grid()
        plt.plot(train_sizes, train_scores_mean, 'o-', color="r", label="Training score")
        plt.plot(train_sizes, test_scores_mean, 'o-', color="g", label="Cross-validation score")
        plt.legend(loc="best")
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close()
        buf.seek(0)
        results['learning_curve_image'] = base64.b64encode(buf.read()).decode('utf-8')
    except Exception as e:
        plt.close()

    # 2. Residuals or ROC
    if task_type == 'regression':
        try:
            residuals = y_test - y_pred
            plt.figure(figsize=(8, 5), dpi=200)
            plt.title("Residuals Plot")
            plt.scatter(y_pred, residuals, alpha=0.5, color='#F59E0B')
            plt.axhline(y=0, color='r', linestyle='--')
            plt.xlabel("Predicted Values")
            plt.ylabel("Residuals")
            plt.grid(True, alpha=0.3)
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close()
            buf.seek(0)
            results['diagnostic_image'] = base64.b64encode(buf.read()).decode('utf-8')
        except Exception as e:
            plt.close()
    elif task_type == 'classification':
        try:
            if hasattr(model, "predict_proba") and len(np.unique(y)) == 2:
                y_prob = model.predict_proba(X_test)[:, 1]
                fpr, tpr, _ = roc_curve(y_test, y_prob)
                roc_auc = auc(fpr, tpr)
                
                plt.figure(figsize=(8, 5), dpi=200)
                plt.plot(fpr, tpr, color='#8B5CF6', lw=2, label=f'ROC curve (area = {roc_auc:.2f})')
                plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
                plt.xlim([0.0, 1.0])
                plt.ylim([0.0, 1.05])
                plt.xlabel('False Positive Rate')
                plt.ylabel('True Positive Rate')
                plt.title('Receiver Operating Characteristic')
                plt.legend(loc="lower right")
                
                buf = io.BytesIO()
                plt.savefig(buf, format='png', bbox_inches='tight')
                plt.close()
                buf.seek(0)
                results['diagnostic_image'] = base64.b64encode(buf.read()).decode('utf-8')
        except Exception as e:
            plt.close()
            
    # 3. 3D Gradient Descent / Loss Landscape Plot
    try:
        fig = plt.figure(figsize=(10, 8), dpi=200)
        ax = fig.add_subplot(111, projection='3d')
        
        w1 = np.linspace(-5, 5, 50)
        w2 = np.linspace(-5, 5, 50)
        W1, W2 = np.meshgrid(w1, w2)
        
        if model_name in ['Linear Regression', 'Logistic Regression', 'SVM']:
            Loss = W1**2 + W2**2
            title = f"{model_name} Loss Landscape (Convex)"
            t = np.linspace(0, 1, 20)
            path_w1 = 4 * (1 - t)**2 * np.cos(t * np.pi)
            path_w2 = 4 * (1 - t)**2 * np.sin(t * np.pi)
            path_loss = path_w1**2 + path_w2**2
        elif model_name in ['Random Forest', 'Decision Tree', 'KNN']:
            Loss = np.sin(W1) * np.cos(W2) + 0.5 * (W1**2 + W2**2)
            title = f"{model_name} Loss Landscape (Non-Convex Simulation)"
            t = np.linspace(0, 1, 20)
            path_w1 = 4 * np.exp(-3*t) * np.cos(5*t)
            path_w2 = 4 * np.exp(-3*t) * np.sin(5*t)
            path_loss = np.sin(path_w1) * np.cos(path_w2) + 0.5 * (path_w1**2 + path_w2**2)
        else: # K-Means
            Loss = np.sin(2*W1) * np.cos(2*W2) + 0.2 * (W1**2 + W2**2)
            title = f"{model_name} Objective Space"
            t = np.linspace(0, 1, 20)
            path_w1 = 4 * np.exp(-2*t) * np.cos(3*t)
            path_w2 = 4 * np.exp(-2*t) * np.sin(3*t)
            path_loss = np.sin(2*path_w1) * np.cos(2*path_w2) + 0.2 * (path_w1**2 + path_w2**2)
            
        surf = ax.plot_surface(W1, W2, Loss, cmap='viridis', alpha=0.8, edgecolor='none')
        ax.plot(path_w1, path_w2, path_loss + 0.5, color='r', marker='o', markersize=4, linewidth=2, label='Optimization Path')
        
        ax.set_xlabel('Parameter w1')
        ax.set_ylabel('Parameter w2')
        ax.set_zlabel('Loss')
        ax.set_title(title)
        ax.legend()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close()
        buf.seek(0)
        results['gradient_3d_image'] = base64.b64encode(buf.read()).decode('utf-8')
    except Exception as e:
        plt.close()
        
    # Existing Feature Importances / Coefficients
        
    try:
        classifier = model.named_steps['classifier']
        feature_names = model.named_steps['preprocessor'].get_feature_names_out()
        has_plot = False
        
        plt.figure(figsize=(10, 6), dpi=200)
        if hasattr(classifier, 'feature_importances_'):
            importances = classifier.feature_importances_
            indices = np.argsort(importances)[::-1][:15]
            plt.title("Feature Importances")
            plt.bar(range(len(indices)), importances[indices], align="center", color='#8B5CF6')
            plt.xticks(range(len(indices)), [feature_names[i] for i in indices], rotation=45, ha='right')
            plt.tight_layout()
            has_plot = True
        elif hasattr(classifier, 'coef_') and not getattr(classifier, 'dual_', False):
            coefs = classifier.coef_
            if coefs.ndim > 1: coefs = coefs[0]
            indices = np.argsort(np.abs(coefs))[::-1][:15]
            plt.title("Model Coefficients (Magnitude)")
            plt.bar(range(len(indices)), coefs[indices], align="center", color='#3B82F6')
            plt.xticks(range(len(indices)), [feature_names[i] for i in indices], rotation=45, ha='right')
            plt.tight_layout()
            has_plot = True
            
        if has_plot:
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight')
            buf.seek(0)
            results['extra_image'] = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
    except Exception as e:
        plt.close()
        
    if model_name == 'Decision Tree':
        try:
            plt.figure(figsize=(12, 8), dpi=300)
            classifier = model.named_steps['classifier']
            feature_names_out = model.named_steps['preprocessor'].get_feature_names_out()
            plot_tree(classifier, filled=True, feature_names=feature_names_out, max_depth=3)
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close()
            buf.seek(0)
            results['tree_image'] = base64.b64encode(buf.read()).decode('utf-8')
        except Exception as e:
            pass
            
    # Generate data for decision boundary plotting (only if 2 features for simplicity)
    if len(numeric_features) + len(categorical_features) == 2:
        try:
            x_min, x_max = X.iloc[:, 0].min() - 1, X.iloc[:, 0].max() + 1
            y_min, y_max = X.iloc[:, 1].min() - 1, X.iloc[:, 1].max() + 1
            xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1), np.arange(y_min, y_max, 0.1))
            
            # Predict using the pipeline to automatically handle preprocessing
            # Create a dataframe for the meshgrid points
            mesh_df = pd.DataFrame(np.c_[xx.ravel(), yy.ravel()], columns=X.columns)
            if hasattr(model.named_steps['classifier'], "predict_proba"):
                Z = model.predict(mesh_df)
                Z = Z.reshape(xx.shape)
                results['decision_boundary'] = {
                    'xx': xx.tolist(),
                    'yy': yy.tolist(),
                    'Z': Z.tolist()
                }
        except Exception as e:
            # Skip decision boundary if any issues occur
            pass
            
    return results
