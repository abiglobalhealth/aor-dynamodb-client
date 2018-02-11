import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pure from 'recompose/pure';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import withWidth from 'material-ui/utils/withWidth';
import muiThemeable from 'material-ui/styles/muiThemeable';
import compose from 'recompose/compose';
import translate from 'admin-on-rest/lib/i18n/translate';

const styles = {
    button: {
        margin: '10px 0',
    },
    pageInfo: {
        padding: '1.2em',
    },
    mobileToolbar: {
        margin: 'auto',
    },
};

export class Pagination extends Component {
    getNbPages() {
        return Math.ceil(this.props.total / this.props.perPage) || 1;
    }

    prevPage = event => {
        event.stopPropagation();
        if (this.props.page === 1) {
            throw new Error(
                this.props.translate('aor.navigation.page_out_from_begin')
            );
        }
        this.props.setPage(this.props.page - 1);
    };

    nextPage = event => {
        event.stopPropagation();
        if (this.props.page > this.getNbPages()) {
            throw new Error(
                this.props.translate('aor.navigation.page_out_from_end')
            );
        }
        this.props.setPage(this.props.page + 1);
    };


    render() {
        const { muiTheme, page, perPage, total, translate, width } = this.props;
        if (total === 0) return null;
        const offsetEnd = Math.min(page * perPage, total);
        const offsetBegin = Math.min((page - 1) * perPage + 1, offsetEnd);
        const nbPages = this.getNbPages();

        return width === 1 ? (
            <Toolbar>
                <ToolbarGroup style={styles.mobileToolbar}>
                    {page > 1 && (
                        <IconButton onClick={this.prevPage}>
                            <ChevronLeft
                                color={muiTheme.palette.primary1Color}
                            />
                        </IconButton>
                    )}
                    <span style={styles.pageInfo}>
                        {translate('aor.navigation.page_range_info', {
                            offsetBegin,
                            offsetEnd,
                            total: page !== nbPages 
                                ? 'many'
                                : total,
                        })}
                    </span>
                    {page !== nbPages && (
                        <IconButton onClick={this.nextPage}>
                            <ChevronRight
                                color={muiTheme.palette.primary1Color}
                            />
                        </IconButton>
                    )}
                </ToolbarGroup>
            </Toolbar>
        ) : (
            <Toolbar>
                <ToolbarGroup firstChild>
                    <span className="displayed-records" style={styles.pageInfo}>
                        {translate('aor.navigation.page_range_info', {
                            offsetBegin,
                            offsetEnd,
                            total: page !== nbPages 
                                ? 'many'
                                : total,
                        })}
                    </span>
                </ToolbarGroup>
                {nbPages > 1 && (
                    <ToolbarGroup>
                        {page > 1 && (
                            <FlatButton
                                className="previous-page"
                                primary
                                key="prev"
                                label={translate('aor.navigation.prev')}
                                icon={<ChevronLeft />}
                                onClick={this.prevPage}
                                style={styles.button}
                            />
                        )}
                        {page !== nbPages && (
                            <FlatButton
                                className="next-page"
                                primary
                                key="next"
                                label={translate('aor.navigation.next')}
                                icon={<ChevronRight />}
                                labelPosition="before"
                                onClick={this.nextPage}
                                style={styles.button}
                            />
                        )}
                    </ToolbarGroup>
                )}
            </Toolbar>
        );
    }
}

Pagination.propTypes = {
    muiTheme: PropTypes.object.isRequired,
    page: PropTypes.number,
    perPage: PropTypes.number,
    setPage: PropTypes.func,
    translate: PropTypes.func.isRequired,
    total: PropTypes.number,
    width: PropTypes.number,
};

const enhance = compose(pure, translate, withWidth(), muiThemeable());

export default enhance(Pagination);
