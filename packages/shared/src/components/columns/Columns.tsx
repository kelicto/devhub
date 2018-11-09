import { EventSubscription } from 'fbemitter'
import React, { PureComponent } from 'react'
import {
  FlatList,
  FlatListProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

import { emitter } from '../../setup'
import { Column, Omit } from '../../types'
import { Separator } from '../common/Separator'
import { DimensionsConsumer } from '../context/DimensionsContext'
import { EventColumn } from './EventColumn'
import { NotificationColumn } from './NotificationColumn'

export interface ColumnsProps
  extends Omit<FlatListProps<Column>, 'renderItem'> {
  contentContainerStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  flatlist: {
    flex: 1,
  },
})

export class Columns extends PureComponent<ColumnsProps> {
  flatListRef = React.createRef<FlatList<Column>>()
  focusOnColumnListener?: EventSubscription
  pagingEnabled: boolean = true
  swipeable: boolean = false

  componentDidMount() {
    this.focusOnColumnListener = emitter.addListener(
      'FOCUS_ON_COLUMN',
      this.handleColumnFocusRequest,
    )
  }

  componentWillUnmount() {
    if (this.focusOnColumnListener) this.focusOnColumnListener.remove()
  }

  handleColumnFocusRequest = ({
    animated,
    columnIndex,
  }: {
    columnId: string
    columnIndex: number
    animated?: boolean
    highlight?: boolean
  }) => {
    if (!this.flatListRef.current) return
    if (!(this.props.data && this.props.data!.length)) return

    if (columnIndex >= 0 && columnIndex < this.props.data.length) {
      this.flatListRef.current.scrollToIndex({
        animated,
        index: columnIndex,
      })
    }
  }

  keyExtractor(column: Column) {
    return `column-container-${column.id}`
  }

  renderItem: FlatListProps<Column>['renderItem'] = ({
    item: column,
    index,
  }) => {
    switch (column.type) {
      case 'notifications': {
        return (
          <NotificationColumn
            key={`notification-column-${column.id}`}
            column={column}
            columnIndex={index}
            pagingEnabled={this.pagingEnabled}
            swipeable={this.swipeable}
          />
        )
      }

      case 'activity': {
        return (
          <EventColumn
            key={`event-column-${column.id}`}
            column={column}
            columnIndex={index}
            pagingEnabled={this.pagingEnabled}
            swipeable={this.swipeable}
          />
        )
      }

      default: {
        console.error('Invalid Column type: ', (column as any).type)
        return null
      }
    }
  }

  render() {
    const { data, style, ...props } = this.props

    return (
      <DimensionsConsumer>
        {({ width }) => {
          this.pagingEnabled = width <= 420

          return (
            <FlatList
              ref={this.flatListRef}
              key="columns-flat-list"
              ItemSeparatorComponent={Separator}
              ListFooterComponent={Separator}
              ListHeaderComponent={Separator}
              bounces={!this.swipeable}
              className="snap-container"
              data={data}
              horizontal
              keyExtractor={this.keyExtractor}
              onScrollToIndexFailed={() => undefined}
              pagingEnabled={this.pagingEnabled}
              removeClippedSubviews
              scrollEnabled={!this.swipeable}
              {...props}
              renderItem={this.renderItem}
              style={[styles.flatlist, style]}
            />
          )
        }}
      </DimensionsConsumer>
    )
  }
}