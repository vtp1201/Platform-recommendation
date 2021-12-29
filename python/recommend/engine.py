from pandas.io import excel
import numpy as np
import scipy
import pandas as pd
import math
import random
import sklearn
from scipy.sparse import csr_matrix
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse.linalg import svds
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import json
import os

person_id = 'user_id'
content_id = 'book_id'
key = 'rating'

class CFRecommender:
    
    MODEL_NAME = 'Collaborative Filtering'
    
    def __init__(self, cf_predictions_df, items_df=None):
        self.cf_predictions_df = cf_predictions_df
        self.items_df = items_df
        
    def get_model_name(self):
        return self.MODEL_NAME

    def recommend_users(self, user_id, users_ids, topn=10, verbose=False):
        sorted_user_predictions = self.cf_predictions_df
        user_df = self.cf_predictions_df[user_id]
        sorted_user_predictions = sorted_user_predictions.drop(user_id, axis=1)
        recommendations_df = pd.DataFrame(columns = users_ids, index = ['sum'])

        for y in users_ids:
            if y == user_id: continue
            sorted_user_predictions[y] = sorted_user_predictions[y] - user_df

        for y in users_ids:
            if y == user_id: continue
            idx = 0
            sum = 0
            for x in sorted_user_predictions[y]:
                x = setValue(x)
                sorted_user_predictions.at[sorted_user_predictions.index[idx], y] = x
                idx = idx + 1
                sum = sum + x
            recommendations_df.at['sum', y] = sum
        
        recommendations_df.at['sum', user_id] = 0
        recommendations_df = recommendations_df.transpose()

        recommendations_df = recommendations_df['sum'].sort_values(ascending=False) \
                                    .reset_index().rename(columns={'sum': 'recStrength'}).rename(columns={'index': person_id})  \
                                    .head(topn)
        return recommendations_df

    def recommend_items(self, user_id, items_to_ignore=[], topn=10, verbose=False):
        # Get and sort the user's predictions
        sorted_user_predictions = self.cf_predictions_df[user_id].sort_values(ascending=False) \
                                    .reset_index().rename(columns={user_id: 'recStrength'})

        # Recommend the highest predicted rating movies that the user hasn't seen yet.
        recommendations_df = sorted_user_predictions[~sorted_user_predictions[content_id].isin(items_to_ignore)] \
                               .sort_values('recStrength', ascending = False) \
                               .head(topn)

        if verbose:
            if self.items_df is None:
                raise Exception('"items_df" is required in verbose mode')

            recommendations_df = recommendations_df.merge(self.items_df, how = 'left', 
                                                          left_on = content_id, 
                                                          right_on = content_id)[[content_id]]


        return recommendations_df

def smooth_user_preference(x):
    return math.log(1+x, 2)

def itemsRecommend(person, cf_recommender_model):
    recommend_dict = {}
    recommend_dict[person_id] = person
    recommend_dict['recommends'] = cf_recommender_model.recommend_items(person, topn=20, verbose=True)[content_id].tolist()
    return recommend_dict

def usersRecommend(person, cf_recommender_model, users_ids):
    recommend_dict = {}
    recommend_dict[person_id] = person
    recommend_dict['recommends'] = cf_recommender_model.recommend_users(person, users_ids=users_ids, topn=20)[person_id].tolist()
    return recommend_dict

def setValue(x):
    y = 0
    if x > -0.0001 and x < 0.0001:
        y = 5
    elif x > -0.001 and x < 0.001:
        y = 4
    elif x > -0.01 and x < 0.01:
        y = 3
    elif x > -0.1 and x < 0.1:
        y = 2
    elif x > -1 and x < 1:
        y = 1
    else: y  = 0
    return y

def get_recommendations(service, userDf, interactionsDf, articlesDf):
    path = os.path.dirname(os.path.abspath(__file__)) + "/files/"
    try:
        if userDf == '.csv':
            user_df = pd.read_csv(path + 'users_df' + userDf)
        if userDf == '.json':
            user_df = pd.read_json(path + 'users_df' + userDf)
        if userDf == '.xlsx' or userDf == '.xls':
            user_df = pd.read_excel(path + 'users_df' + userDf)
        if interactionsDf == '.csv':
            interactions_df = pd.read_csv(path + 'interactions_df' + interactionsDf)
        if interactionsDf == '.json':
            interactions_df = pd.read_json(path + 'interactions_df' + interactionsDf)
        if interactionsDf == '.xlsx' or interactionsDf == '.xls':
            interactions_df = pd.read_excel(path + 'interactions_df' + interactionsDf)
        if articlesDf == '.csv':
            articles_df = pd.read_csv(path + 'articles_df' + articlesDf)
        if articlesDf == '.json':
            articles_df = pd.read_json(path + 'articles_df' + articlesDf)
        if articlesDf == '.xlsx' or articlesDf == '.xls':
            articles_df = pd.read_excel(path + 'articles_df' + articlesDf)
    except:
        return "error, can't read files"
    try:
        arrKey = key.split(',')
        event_Strength = 'eventStrength'
        event_Type = arrKey[0]
        event_type_strength = {}
        if len(arrKey) == 1:
            if(interactions_df[event_Type].dtype == np.float64 or interactions_df[event_Type].dtype == np.int64):   
                interactions_df[event_Strength] = interactions_df[event_Type]

            else:
                return "error, files in interactions wrong"

        else:
            arrKey.pop(0)
            for idx, arr in enumerate(arrKey):
                event_type_strength[arr] = idx + 1.0
            
            interactions_df[event_Strength] = interactions_df[event_Type].apply(lambda x: event_type_strength[x])
    except:
        return "error, can't create event_type_strength"
    try:
        users_interactions_count_df = interactions_df.groupby([person_id, content_id]).size().groupby(person_id).size()
        users_with_enough_interactions_df = users_interactions_count_df[users_interactions_count_df >= 5].reset_index()[[person_id]]
        interactions_from_selected_users_df = interactions_df.merge(users_with_enough_interactions_df, 
                    how = 'right',
                    left_on = person_id,
                    right_on = person_id)

        interactions_full_df = interactions_from_selected_users_df \
                            .groupby([person_id, content_id])[event_Strength].sum() \
                            .apply(smooth_user_preference).reset_index()
            
        users_items_pivot_matrix_df = interactions_full_df.pivot(index= person_id, 
                                                            columns= content_id, 
                                                            values=event_Strength).fillna(0)
                                                            
        users_items_pivot_matrix = users_items_pivot_matrix_df.values
        users_ids = list(users_items_pivot_matrix_df.index)
        users_items_pivot_sparse_matrix = csr_matrix(users_items_pivot_matrix)
        NUMBER_OF_FACTORS_MF = 15
        U, sigma, Vt = svds(users_items_pivot_sparse_matrix, k = NUMBER_OF_FACTORS_MF)

        sigma = np.diag(sigma)

        all_user_predicted_ratings = np.dot(np.dot(U, sigma), Vt) 

        all_user_predicted_ratings_norm = (all_user_predicted_ratings - all_user_predicted_ratings.min()) / (all_user_predicted_ratings.max() - all_user_predicted_ratings.min())
    except:
        return "error, can't extract data_matrix"

    try:
        #Converting the reconstructed matrix back to a Pandas dataframe
        cf_preds_df = pd.DataFrame(all_user_predicted_ratings_norm, columns = users_items_pivot_matrix_df.columns, index=users_ids).transpose()

        cf_recommender_model = CFRecommender(cf_preds_df, articles_df)

        person_list = users_ids
        recommend_list = []
        if service == 'user to user':
            for idx, person in enumerate(person_list):
                recommend_list.append(usersRecommend(person, cf_recommender_model, users_ids))
                print(idx)
                if idx == 20:
                    break
        else:
            for idx, person in enumerate(person_list):
                recommend_list.append(itemsRecommend(person, cf_recommender_model))
                if idx == 3000:
                    break
    except:
        return "error, can't create recommends"
    
    exportFile = path + "recommends.json"
    json_string = json.dumps(recommend_list)
    jsonFile = open(exportFile, "w")
    jsonFile.write(json_string)
    jsonFile.close()
    return "complete"

    

