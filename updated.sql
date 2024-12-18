--User Management Functions Start
  
  --User Registration
  CREATE OR REPLACE FUNCTION register_user(user_id VARCHAR,username VARCHAR, email VARCHAR, password VARCHAR)
  RETURNS TEXT AS $$
  BEGIN
    insert into user_info(user_id,username,email,user_psw,created_date)
    VALUES(user_id,username,email,password,NOW());
    
    RETURN 'User registered successfully!';
  END;
  $$ LANGUAGE plpgsql;
  
  --Login User
  CREATE OR REPLACE FUNCTION login_user(userid VARCHAR, password VARCHAR)
  RETURNS TABLE(user_id VARCHAR, username VARCHAR, email VARCHAR) AS $$
  BEGIN
    RETURN QUERY 
    SELECT user_info.user_id, user_info.username, user_info.email
    FROM user_info
    WHERE user_info.user_id = login_user.userid AND user_info.user_psw = login_user.password;
  END;
  $$ LANGUAGE plpgsql;

--Update user
  CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id VARCHAR,
    p_username VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_password VARCHAR DEFAULT NULL
  )
  RETURNS VOID AS $$
  BEGIN
    -- Update the username if a new one is provided
    IF p_username IS NOT NULL THEN
        UPDATE user_info
        SET username = p_username
        WHERE user_id = p_user_id;
    END IF;

    -- Update the email if a new one is provided
    IF p_email IS NOT NULL THEN
        UPDATE user_info
        SET email = p_email
        WHERE user_id = p_user_id;
    END IF;

    -- Update the password if a new one is provided
    IF p_password IS NOT NULL THEN
        UPDATE user_info
        SET user_psw = p_password
        WHERE user_id = p_user_id;
    END IF;
  END;
  $$ LANGUAGE plpgsql;


  --Remove User
  CREATE OR REPLACE FUNCTION delete_user(user_id VARCHAR)
  RETURNS VOID AS $$
  BEGIN
    DELETE FROM user_info WHERE user_id = delete_user.user_id;
  END;
  $$ LANGUAGE plpgsql;
  
  
  --User Management Ends Here
  
  --Bookmark Management Functions Start
  
  --BookMark Title
  CREATE OR REPLACE FUNCTION bookmark_title(user_id VARCHAR, title_id VARCHAR)
  RETURNS VOID AS $$
  BEGIN
    INSERT INTO bookmark (userid, title_id) 
    VALUES (user_id, title_id);
  END;
  $$ LANGUAGE plpgsql;

--Remove Bookmark
  CREATE OR REPLACE FUNCTION remove_bookmark(bookmark_id INT)
  RETURNS TEXT AS $$
  BEGIN
    DELETE FROM bookmark WHERE bookmark.bookmark_id = remove_bookmark.bookmark_id;
    
    RETURN 'Bookmark deleted successfully.';
  END;
  $$ LANGUAGE plpgsql;

  --List Users Bookmark
  CREATE OR REPLACE FUNCTION list_user_bookmarks(userid VARCHAR)
  RETURNS TABLE(bookmark_id INT, title_name text, user_id VARCHAR) AS $$
  BEGIN
    RETURN QUERY
    SELECT b.bookmark_id, t.primarytitle, b.userid
    FROM bookmark b
    JOIN title_basics t ON b.title_id = t.tconst    
    WHERE b.userid = list_user_bookmarks.userid;
  END;
  $$ LANGUAGE plpgsql;
  

  -- Bookmark Management Functions End Here

  --User notes Functions Starts
  
  --Add notes to title
  CREATE OR REPLACE FUNCTION add_note_to_title(user_id VARCHAR, title_id VARCHAR, note TEXT)
   RETURNS VOID AS $$
  BEGIN
    INSERT INTO notes (user_id, tconst, note,created_at)
    VALUES (user_id, title_id, note,now());
  END;
  $$ LANGUAGE plpgsql;

--get notes for title
  CREATE OR REPLACE FUNCTION get_notes_for_title(user_id VARCHAR, title_id VARCHAR)
  RETURNS TABLE(note_id INT, note TEXT, created_at TIMESTAMP, updated_at TIMESTAMP) AS $$
  BEGIN
    RETURN QUERY
    SELECT n.note_id, n.note, n.created_at, n.updated_at
    FROM notes n
    WHERE n.user_id = get_notes_for_title.user_id AND n.tconst = get_notes_for_title.title_id;
  END;
  $$ LANGUAGE plpgsql;

--Edit Note for title
  CREATE OR REPLACE FUNCTION edit_note_for_title(note_id INT, updated_note TEXT)
  RETURNS TEXT AS $$
  BEGIN
    UPDATE notes
    SET note = updated_note, updated_at = CURRENT_TIMESTAMP
    WHERE notes.note_id = edit_note_for_title.note_id;
    
    RETURN 'Notes Updated Successfully!';
  END;
  $$ LANGUAGE plpgsql;

  --Delete notes
  CREATE OR REPLACE FUNCTION delete_note_for_title(note_id INT)
  RETURNS VOID AS $$
  BEGIN
    DELETE FROM notes WHERE note_id = delete_note_for_title.note_id;
  END;
  $$ LANGUAGE plpgsql;

  --User Notes Functions End Here
  
  --Search History Functions starts
  
  --Create search history
  CREATE OR REPLACE FUNCTION create_search_history(user_id VARCHAR, search_query TEXT)
  RETURNS VOID AS $$
  BEGIN
    INSERT INTO search_history (user_id, search_query)
    VALUES (user_id, search_query);
  END;
  $$ LANGUAGE plpgsql;

--get search history
  CREATE OR REPLACE FUNCTION get_search_history(user_id VARCHAR)
  RETURNS TABLE(search_id INT, search_query TEXT, search_time TIMESTAMP) AS $$
  BEGIN
    RETURN QUERY
    SELECT search_id, search_query, search_time
    FROM search_history
    WHERE user_id = get_search_history.user_id
    ORDER BY search_time DESC;
  END;
  $$ LANGUAGE plpgsql;
  
  -- Search history functions ends here
  
  --rating hsitory functions starts
  
  --rate title
  CREATE OR REPLACE FUNCTION rate_title(user_id VARCHAR, title_id VARCHAR, rating INT)
  RETURNS VOID AS $$
  BEGIN
    INSERT INTO user_rating (user_id, tconst, rating,rated_date)
    VALUES (user_id, title_id, rating,CURRENT_TIMESTAMP);
  END;  
  $$ LANGUAGE plpgsql;

  --get rating history
  CREATE OR REPLACE FUNCTION get_rating_history(user_id VARCHAR)
  RETURNS TABLE(title_name TEXT, rating INT, rated_at date) AS $$
  BEGIN
    RETURN QUERY
    SELECT t.primarytitle, r.rating, r.rated_date
    FROM user_rating r
    JOIN title_basics t ON r.tconst = t.tconst
    WHERE r.user_id = get_rating_history.user_id
    ORDER BY r.rated_date DESC;
  END;
  $$ LANGUAGE plpgsql;
  
  --rating history fundctions ends here
  
  -- simple search function starts
  CREATE OR REPLACE FUNCTION string_search(
    s_user_id VARCHAR,
    s_search_string TEXT
  )
  RETURNS TABLE(tconst char, primarytitle TEXT) AS $$
  BEGIN
    -- Log the search term in the search history
    INSERT INTO search_history (user_id, search_query,search_time)
    VALUES (s_user_id, s_search_string,CURRENT_TIMESTAMP);

    -- Return all movies where the search string is a substring of the primary title or plot
    RETURN QUERY
    SELECT title_basics.tconst, title_basics.primarytitle
    FROM title_basics
    WHERE title_basics.primarytitle ILIKE '%' || s_search_string || '%';  -- Case-insensitive search
  END;
  $$ LANGUAGE plpgsql;
  --simple search function ends
  
  --rating functions starts
  CREATE OR REPLACE FUNCTION rate(
    p_user_id VARCHAR,
    p_title_id VARCHAR,
    p_rating INT
  )
  RETURNS VOID AS $$
  DECLARE
    existing_rating INT;
    current_avg_rating DECIMAL(3, 2);
    current_num_of_votes INT;
    
  BEGIN
     -- Validate that rating is between 1 and 10
    IF p_rating < 1 OR p_rating > 10 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 10';
    END IF;
    
      -- Check if the user has already rated this title
    SELECT rating INTO existing_rating
    FROM user_rating 
    WHERE user_id = p_user_id AND tconst = p_title_id;

    -- If a rating exists, update the rating
    IF FOUND THEN
        -- Get the current average rating and number of ratings
        SELECT averagerating, numvotes INTO current_avg_rating, current_num_of_votes
        FROM title_ratings
        WHERE tconst = p_title_id;
  
  -- Recalculate the average rating: Subtract the old rating and add the new one
        current_avg_rating := ((current_avg_rating * current_num_of_votes) - existing_rating + p_rating)/                    current_num_of_votes;

        -- Update the user's rating
        UPDATE user_rating
        SET rating = p_rating, rated_date = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id AND tconst = p_title_id;

        -- Update the average rating for the title
        UPDATE title_ratings
        SET averagerating = current_avg_rating
        WHERE tconst = p_title_id;
        
    ELSE
        -- If no existing rating, insert the new rating
        INSERT INTO user_rating (user_id, tconst, rating)
        VALUES (p_user_id, p_title_id, p_rating);

        -- Get the current average rating and number of ratings
        SELECT averagerating, numvotes INTO current_avg_rating, current_num_of_votes
        FROM title_ratings
        WHERE tconst = p_title_id;

        -- Recalculate the average rating: Add the new rating and increase the number of ratings
        current_avg_rating := ((current_avg_rating * current_num_of_votes) + p_rating) / (current_num_of_votes + 1);

        -- Update the title's average rating and increment the number of ratings
        UPDATE title_ratings
        SET averagerating = current_avg_rating, numvotes = numvotes + 1
        WHERE tconst = p_title_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
  
  -- rating functions ends here
  
  --Exact match querying starts 

CREATE OR REPLACE FUNCTION exact_match(VARIADIC word TEXT[])
RETURNS TEXT AS $$

DECLARE 
    exact_word TEXT;
    t TEXT := '';  -- Initialize the result variable
    tconst_record RECORD;  -- Declare a record to hold the result of the query
BEGIN
    -- Loop over the input array
    FOREACH exact_word IN ARRAY word
    LOOP
        -- Append results from the query to the result string
        FOR tconst_record IN 
            (SELECT title_basics.primarytitle,title_basics.tconst FROM wi 
            join title_basics on title_basics.tconst=wi.tconst
            WHERE wi.word = exact_word)
        LOOP
            t := t || tconst_record.tconst || ', ';  -- Concatenate each result with a space
        END LOOP;
    END LOOP;
    
    -- Return the final concatenated result
    RETURN t;
END $$ LANGUAGE plpgsql;


--Exact match querying ends here

--best match function starts
CREATE OR REPLACE FUNCTION best_match(VARIADIC word TEXT[])
RETURNS TABLE (tconst TEXT, title TEXT, rank INT) AS $$

BEGIN
    
    RETURN QUERY
    WITH rank_count AS (
        SELECT
            tconst,
            primarytitle AS title,
            COUNT(DISTINCT wi.word) AS rank_count
        FROM
            wi
        WHERE
            wi.word = word
        GROUP BY
            tconst, primarytitle
    )
   
    SELECT
        tconst, 
        title, 
        rank_count
    FROM
        rank_count
    ORDER BY
        rank_count DESC;
    
END $$ LANGUAGE plpgsql;


--best match function ends here


--wordtoword seach function starts here

CREATE OR REPLACE FUNCTION word_to_words_query(VARIADIC keywords TEXT[])
RETURNS TABLE (word TEXT, frequency INT) AS $$
BEGIN
    -- Step 1: Query the titles that match the provided keywords
    RETURN QUERY
    WITH matching_titles AS (
        -- Select all titles that match any of the given keywords
        SELECT DISTINCT tconst
        FROM wi
        WHERE word = ANY(keywords)
    ),
    -- Step 2: Collect the words associated with the matching titles
    word_frequencies AS (
        SELECT wi.word, COUNT(*) AS frequency
        FROM wi
        JOIN title_basics tb ON wi.tconst = tb.tconst
        GROUP BY wi.word
    )
    -- Step 3: Return the words in decreasing order of frequency
    SELECT word, frequency
    FROM word_frequencies
    ORDER BY frequency DESC;
    
END $$ LANGUAGE plpgsql;

-- word to word functions ends here

--frequent person words function starts here

CREATE OR REPLACE FUNCTION person_words(person_name TEXT,word_length INT DEFAULT 10)
RETURNS TABLE (word TEXT, frequency INT) AS $$
BEGIN
  RETURN QUERY
    WITH person_name AS (
        SELECT DISTINCT tconst
        FROM name_basics nb
        join title_basics tb on tb.nconst=nb.nconst
        WHERE nb.primaryname = person_name
    ),
    word_frequencies AS (
        SELECT wi.word, COUNT(*) AS frequency
        FROM wi
        JOIN person_name ON wi.tconst = person_name.tconst
        WHERE wi.word IS NOT NULL  
        GROUP BY wi.word
    )
    SELECT word, frequency
    FROM word_frequencies
    ORDER BY frequency DESC
    LIMIT limit_words;



END $$ LANGUAGE plpgsql;

--frequent person words function ends here

  
  

