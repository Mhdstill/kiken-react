import React, { useState } from 'react';
import '../../style.less';

const SearchBar = (props: any) => {
    const [isClicked, setIsClicked] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const onChange = props.onChange;

    const handleSearch = (value: any) => {
        setSearchValue(value);
    };

    const handleInputClick = () => {
        setIsClicked(true);
    };

    const handleInputBlur = () => {
        if (searchValue === '') {
            setIsClicked(false);
        }
    };

    return (
        <div className="search-bar w-100">
            <input
                id="searchbar"
                onChange={onChange}
                onClick={handleInputClick}
                onBlur={handleInputBlur}
                type="text"
                className={`form-control form-control-lg focused bg-white mb-3 w-100 ${isClicked ? 'clicked' : ''}`}
                placeholder={isClicked ? '' : 'Rechercher...'}
            />
        </div>
    );
};

export default SearchBar;
